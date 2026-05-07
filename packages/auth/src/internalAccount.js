// Encapsulates better-auth's `instance.$context.internalAdapter` access so
// callers don't reach into private internals from multiple places.
// Tied to the better-auth version pinned in this package's package.json —
// `findAccountByUserId` / `createAccount` / `updatePassword` /
// `deleteAccount` / `deleteSessions` are not part of better-auth's public
// API surface.

import { verify as verifyHash } from './password.js';

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
  // because `internalAdapter.deleteSessions` treats a non-string arg as an
  // array of session tokens and silently skips the Redis purge.
  async function revokeUserSessions(userId) {
    const adapter = await getAdapter();
    await adapter.deleteSessions(String(userId));
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
    deleteCredentialAccount,
    deleteOAuthAccount,
    deleteAllOAuthAccounts,
    revokeUserSessions,
    verifyCredentialPassword,
    getAccountTypesByUserId,
  };
}
