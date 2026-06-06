// AS-side OAuth grant revocation + a subject-still-allowed check, pure over the
// better-auth model-aware `adapter` (same contract as gcExpired.js: logical
// `field` names map to columns, no raw SQL — so this owns no table/column
// literals and stays correct if the storage layer changes). index.js /
// internalAccount.js wire these to `(await instance.$context).adapter`; tests
// pass a stub.

// Revoke every OAuth grant a user holds, so a banned/removed user can mint NO new
// tokens:
//   - delete their `oauthConsent` rows → no silent re-grant on a future authorize;
//   - mark their `oauthRefreshToken` rows `revoked` → the provider rejects a
//     revoked refresh (see @better-auth/oauth-provider handleRefreshTokenGrant);
//   - delete their `oauthAccessToken` rows → no introspectable live token.
// Already-issued JWS access tokens are verified LOCALLY (JWKS), so they cannot be
// killed mid-life here — they lapse at their TTL. The data path is cut sooner by
// the token-exchange re-check (`isUserActiveByUid`), which refuses to mint an
// `aud=api` token for a no-longer-active user. `userId` is the better-auth user
// row id (the `user_id` column), NOT the OA `uid`.
export async function revokeUserGrants(adapter, userId) {
  const where = [{ field: 'userId', operator: 'eq', value: String(userId) }];
  const consents = await adapter.deleteMany({ model: 'oauthConsent', where });
  const refreshTokens = await adapter.updateMany({
    model: 'oauthRefreshToken',
    where,
    update: { revoked: new Date() },
  });
  const accessTokens = await adapter.deleteMany({
    model: 'oauthAccessToken',
    where,
  });
  const num = (v) => (typeof v === 'number' ? v : null);
  return {
    consents: num(consents),
    refreshTokens: num(refreshTokens),
    accessTokens: num(accessTokens),
  };
}

// May the user behind an OA `uid` still obtain API access? Reads the user row by
// `uid` via the model-aware adapter — which returns `returned:false` fields like
// `isRemoved` (that filtering is an API-output concern, not the adapter's; cf.
// the sign-in guard reading `isRemoved` off `internalAdapter` in index.js). Fails
// CLOSED: a missing row, or either flag set, ⇒ not active. `uid` is the OA user
// id (a number — the token's private claim), NOT the better-auth row id.
export async function isUserActiveByUid(adapter, uid) {
  const user = await adapter.findOne({
    model: 'user',
    where: [{ field: 'uid', operator: 'eq', value: uid }],
  });
  return !!user && !user.isRemoved && !user.isBlacklisted;
}
