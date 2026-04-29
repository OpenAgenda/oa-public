// Encapsulates better-auth's `instance.$context.internalAdapter` access so
// callers don't reach into private internals from multiple places.
// Tied to the better-auth version pinned in this package's package.json —
// `findAccountByUserId` / `createAccount` / `updatePassword` /
// `deleteAccount` / `deleteSessions` are not part of better-auth's public
// API surface.

const CREDENTIAL = 'credential';

export default function createCredentialHelpers(instance) {
  const getAdapter = async () => (await instance.$context).internalAdapter;

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

  // OAuth rows (providerId !== 'credential') are left untouched; phase 4.
  async function deleteCredentialAccount(userId) {
    const adapter = await getAdapter();
    const accounts = await adapter.findAccountByUserId(userId);
    for (const account of accounts) {
      if (account.providerId === CREDENTIAL) {
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

  return {
    upsertCredentialAccount,
    updateCredentialPassword,
    deleteCredentialAccount,
    revokeUserSessions,
  };
}
