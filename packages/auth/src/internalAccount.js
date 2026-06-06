// Encapsulates better-auth's `instance.$context.internalAdapter` access so
// callers don't reach into private internals from multiple places.
// Tied to the better-auth version pinned in this package's package.json —
// `findAccountByUserId` / `createAccount` / `updatePassword` /
// `deleteAccount` / `deleteUserSessions` are not part of better-auth's public
// API surface (and the by-user `deleteUserSessions` vs by-token `deleteSessions`
// split landed in 1.6.13 — see `revokeUserSessions` below).

import { hash as hashPassword, verify as verifyHash } from './password.js';
import { revokeUserGrants as revokeGrants } from './oauthGrants.js';

const CREDENTIAL = 'credential';
const OAUTH_PROVIDERS = ['google', 'facebook'];

export default function createCredentialHelpers(instance) {
  const getAdapter = async () => (await instance.$context).internalAdapter;

  // Verifies a plaintext password against the credential `account.password`
  // for `userId` (PK, not OA `uid`). Goes through the `verify` routine that
  // accepts both argon2id and the legacy sentinel formats — the same one BA
  // calls on `/sign-in/email`. Returns `false` when the user has no
  // credential account (OAuth-only) or the password is wrong.
  //
  // Use this from non-BA endpoints that need a password challenge (delete
  // agenda, delete account, change email, …) so they read the same hash BA
  // is actually validating against, not the legacy `user.password` column
  // which is `NULL` for accounts created via better-auth.
  async function verifyCredentialPassword(userId, password) {
    if (typeof password !== 'string' || password.length === 0) return false;
    const adapter = await getAdapter();
    const accounts = await adapter.findAccountByUserId(userId);
    const credential = accounts.find((a) => a.providerId === CREDENTIAL);
    if (!credential || typeof credential.password !== 'string') return false;
    return verifyHash({ hash: credential.password, password });
  }

  async function upsertCredentialAccount(userId, encodedHash) {
    const adapter = await getAdapter();
    const accounts = await adapter.findAccountByUserId(userId);
    if (accounts.some((a) => a.providerId === CREDENTIAL)) {
      await adapter.updatePassword(userId, encodedHash);
      return;
    }
    await adapter.createAccount({
      userId,
      accountId: String(userId),
      providerId: CREDENTIAL,
      password: encodedHash,
    });
  }

  async function updateCredentialPassword(userId, encodedHash) {
    const adapter = await getAdapter();
    await adapter.updatePassword(userId, encodedHash);
  }

  // Admin-driven password reset: hash a plaintext password with argon2id and
  // upsert the credential account for `userId`. No `currentPassword` check —
  // this is invoked from a superadmin-gated endpoint, not by the user.
  //
  // Hashes via the same routine as new BA credentials (argon2id) so the row
  // matches whatever a fresh `/sign-up/email` would produce. Upsert covers
  // the case of an OAuth-only user being given a password by the admin.
  async function adminSetPassword(userId, password) {
    if (typeof password !== 'string' || password.length === 0) {
      throw new Error('adminSetPassword: password is required');
    }
    if (userId === undefined || userId === null) {
      throw new Error('adminSetPassword: userId is required');
    }
    const encoded = await hashPassword(password);
    await upsertCredentialAccount(userId, encoded);
  }

  async function deleteCredentialAccount(userId) {
    const adapter = await getAdapter();
    const accounts = await adapter.findAccountByUserId(userId);
    for (const account of accounts) {
      if (account.providerId === CREDENTIAL) {
        await adapter.deleteAccount(account.id);
      }
    }
  }

  async function deleteOAuthAccount(userId, providerId) {
    const adapter = await getAdapter();
    const accounts = await adapter.findAccountByUserId(userId);
    for (const account of accounts) {
      if (account.providerId === providerId) {
        await adapter.deleteAccount(account.id);
      }
    }
  }

  async function deleteAllOAuthAccounts(userId) {
    const adapter = await getAdapter();
    const accounts = await adapter.findAccountByUserId(userId);
    for (const account of accounts) {
      if (OAUTH_PROVIDERS.includes(account.providerId)) {
        await adapter.deleteAccount(account.id);
      }
    }
  }

  // `userId` is the user PK (BIGINT id), NOT the OA `uid`. Coerced to string
  // so it matches the `active-sessions-${userId}` Redis key BA wrote at
  // sign-in. `deleteUserSessions` (NOT `deleteSessions`, which takes an array
  // of session tokens) reads that list, deletes every token, and drops the
  // list key — the by-user purge `deleteSessions(userId)` used to do before
  // better-auth 1.6.13 split the two.
  async function revokeUserSessions(userId) {
    const adapter = await getAdapter();
    await adapter.deleteUserSessions(String(userId));
  }

  // Revoke the user's OAuth provider grants (consents + refresh/access tokens) so
  // a banned/removed user mints no new tokens. Uses the model-aware `adapter`
  // (NOT the `internalAdapter` above) since the oauth-provider tables have no
  // dedicated internalAdapter methods — the same low-level access gcExpired uses.
  // Pairs with the token-exchange re-check that cuts the data path before any
  // already-issued JWS access token lapses. `userId` is the user PK, not the OA uid.
  async function revokeUserGrants(userId) {
    const { adapter } = await instance.$context;
    return revokeGrants(adapter, userId);
  }

  // Re-snapshot the user into every active Redis session WITHOUT logging the
  // user out. `internalAdapter.updateUser` writes the row (via BA's own kysely
  // adapter — NOT through Feathers, so no user-hook loop) then internally
  // calls `refreshUserSessions(updatedUser)`, which rewrites the cached
  // `{ session, user }` of each `active-sessions-${id}` entry. `updateUser`
  // re-selects the full row and parses it through BA's output transform, so
  // the snapshot carries the full BA user shape (camelCase keys: uid, culture,
  // transverseApiAccess, isNew, isBlacklisted, image, name) with current
  // values — exactly what `req.user` reads. This is the BA-aware replacement
  // for the old `@openagenda/sessions` `sessions.refresh`: call it after an
  // out-of-band Feathers patch mutated a session-mirrored field.
  //
  // `{}` is enough: BA's core `updatedAt` field carries
  // `onUpdate: () => new Date()`, so the adapter always includes `updated_at`
  // in the UPDATE — a valid non-empty `SET`. (Passing no data at all would make
  // BA's `transformInput` read `data[field]` off `undefined` and throw.)
  async function refreshUserSessions(userId) {
    const adapter = await getAdapter();
    await adapter.updateUser(String(userId), {});
  }

  // Returns the set of provider ids attached to each user. Used by the
  // Feathers `populateAccountTypes` hook to compute `hasLocalAccount` /
  // `hasSocialAccount` from the BA `account` table — the legacy
  // `user.{password, facebook_uid, twitter_id, google_id}` columns are
  // stale for BA-only users (signup via /sign-up/email or /callback/:id
  // never mirrors back to the legacy columns).
  //
  // `internalAdapter.findAccounts` does not accept an array, so we fan out
  // with `Promise.all`. Acceptable for the only multi-user callsite — admin
  // member listings of a few dozen rows. `Map` keyed by the input form of
  // each id (string vs number) so callers can read it back without coercing.
  async function getAccountTypesByUserId(userIds) {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    if (ids.length === 0) return new Map();
    const adapter = await getAdapter();
    const results = await Promise.all(
      ids.map(async (id) => {
        const accounts = await adapter.findAccounts(id);
        return [id, new Set(accounts.map((a) => a.providerId))];
      }),
    );
    return new Map(results);
  }

  return {
    upsertCredentialAccount,
    updateCredentialPassword,
    adminSetPassword,
    deleteCredentialAccount,
    deleteOAuthAccount,
    deleteAllOAuthAccounts,
    revokeUserSessions,
    revokeUserGrants,
    refreshUserSessions,
    verifyCredentialPassword,
    getAccountTypesByUserId,
  };
}
