import { jest } from '@jest/globals';
import createCredentialHelpers from '../src/internalAccount.js';

function fakeInstance(internalAdapter) {
  return { $context: Promise.resolve({ internalAdapter }) };
}

describe('auth - unit: credential helpers', () => {
  it('inserts a new credential account when none exists', async () => {
    const adapter = {
      findAccountByUserId: jest.fn().mockResolvedValue([
        // Non-credential providers must not be treated as existing.
        { providerId: 'google', password: null },
      ]),
      createAccount: jest.fn().mockResolvedValue(undefined),
      updatePassword: jest.fn().mockResolvedValue(undefined),
    };
    const { upsertCredentialAccount } = createCredentialHelpers(
      fakeInstance(adapter),
    );

    await upsertCredentialAccount(42, 'legacy-sha256$s$h');

    expect(adapter.createAccount).toHaveBeenCalledWith({
      userId: 42,
      accountId: '42',
      providerId: 'credential',
      password: 'legacy-sha256$s$h',
    });
    expect(adapter.updatePassword).not.toHaveBeenCalled();
  });

  it('updates the password when a credential row already exists', async () => {
    const adapter = {
      findAccountByUserId: jest
        .fn()
        .mockResolvedValue([{ providerId: 'credential', password: 'old' }]),
      createAccount: jest.fn(),
      updatePassword: jest.fn().mockResolvedValue(undefined),
    };
    const { upsertCredentialAccount } = createCredentialHelpers(
      fakeInstance(adapter),
    );

    await upsertCredentialAccount(42, 'legacy-sha256$s$h');

    expect(adapter.updatePassword).toHaveBeenCalledWith(
      42,
      'legacy-sha256$s$h',
    );
    expect(adapter.createAccount).not.toHaveBeenCalled();
  });

  it('propagates errors from createAccount (caller swallows them)', async () => {
    const adapter = {
      findAccountByUserId: jest.fn().mockResolvedValue([]),
      createAccount: jest.fn().mockRejectedValue(new Error('boom')),
      updatePassword: jest.fn(),
    };
    const { upsertCredentialAccount } = createCredentialHelpers(
      fakeInstance(adapter),
    );

    await expect(upsertCredentialAccount(42, 'x')).rejects.toThrow(/boom/);
    expect(adapter.updatePassword).not.toHaveBeenCalled();
  });

  it('updateCredentialPassword delegates to updatePassword', async () => {
    const adapter = { updatePassword: jest.fn().mockResolvedValue(undefined) };
    const { updateCredentialPassword } = createCredentialHelpers(
      fakeInstance(adapter),
    );

    await updateCredentialPassword(7, 'enc');

    expect(adapter.updatePassword).toHaveBeenCalledWith(7, 'enc');
  });
});
