// Encapsulates better-auth's `instance.$context.internalAdapter` access so
// callers don't reach into private internals from multiple places.
// Tied to the better-auth version pinned in this package's package.json —
// `findAccountByUserId` / `createAccount` / `updatePassword` are not part of
// better-auth's public API surface.

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

  return { upsertCredentialAccount, updateCredentialPassword };
}
