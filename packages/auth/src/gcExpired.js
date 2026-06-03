// Periodic GC of rows neither better-auth nor the oauth-provider purge on their
// own. Pure over the better-auth `adapter` (model-aware: `field` names map to
// columns, no raw SQL — so this owns no table/column literals and stays correct
// if the storage layer changes). index.js wires it to
// `(await instance.$context).adapter`; tests pass a mock. Returns per-model
// deleted counts.
//
//   - sessions: better-auth deletes an expired session only LAZILY, on the next
//     read of THAT session — an abandoned one's row lives forever otherwise.
//     With `storeSessionInDatabase` on, the largest source of dead rows.
//   - verification rows (email-verify / password-reset tokens): same lazy story —
//     only removed when consumed, so unused-but-expired ones accumulate.
//   - oauth access/refresh tokens: never purged. `expiresAt < now` also excludes
//     non-expiring tokens for free (NULL < x is false in SQL).
//   - oauth clients: an open DCR registry accumulates clients nobody approved. A
//     client a user authorized has an `oauthConsent` row (which outlives token
//     expiry) → kept regardless of age. We delete only clients created before
//     the cutoff with ZERO consent rows; `trustedClients` (skip-consent, hence
//     also no consent row) are excluded so they are never reaped.
export default async function gcExpired(
  adapter,
  { trustedClients = [], olderThanDays = 30, clientBatch = 500 } = {},
) {
  const now = new Date();
  const clientCutoff = new Date(now.getTime() - olderThanDays * 86400000);

  const deleteExpired = (model) =>
    adapter.deleteMany({
      model,
      where: [{ field: 'expiresAt', operator: 'lt', value: now }],
    });

  const sessions = await deleteExpired('session');
  const verifications = await deleteExpired('verification');
  const accessTokens = await deleteExpired('oauthAccessToken');
  const refreshTokens = await deleteExpired('oauthRefreshToken');

  // Old DCR clients, each checked individually for an approval so a large
  // consent set can never truncate into dropping an in-use client. Bounded by
  // `clientBatch` per run (eventual cleanup of any overflow).
  const trustedIds = new Set(trustedClients.map((c) => c.clientId));
  const candidates = await adapter.findMany({
    model: 'oauthClient',
    where: [{ field: 'createdAt', operator: 'lt', value: clientCutoff }],
    limit: clientBatch,
  });
  const approvals = await Promise.all(
    candidates.map((c) =>
      (trustedIds.has(c.clientId)
        ? Promise.resolve(1) // treat trusted as approved → never reaped
        : adapter.count({
          model: 'oauthConsent',
          where: [{ field: 'clientId', operator: 'eq', value: c.clientId }],
        }))),
  );
  const unused = candidates
    .filter((_, i) => approvals[i] === 0)
    .map((c) => c.clientId);
  const clients = unused.length
    ? await adapter.deleteMany({
      model: 'oauthClient',
      where: [{ field: 'clientId', operator: 'in', value: unused }],
    })
    : 0;

  const count = (v) => (typeof v === 'number' ? v : null);
  return {
    sessions: count(sessions),
    verifications: count(verifications),
    accessTokens: count(accessTokens),
    refreshTokens: count(refreshTokens),
    clients: count(clients) ?? unused.length,
  };
}
