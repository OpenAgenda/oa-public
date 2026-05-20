import { jest } from '@jest/globals';
import createCredentialHelpers from '../src/internalAccount.js';
import { ARGON2ID_PREFIX } from '../src/password.js';

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

  describe('adminSetPassword', () => {
    it('hashes the plaintext with argon2id and updates the existing credential row', async () => {
      const adapter = {
        findAccountByUserId: jest
          .fn()
          .mockResolvedValue([{ providerId: 'credential', password: 'old' }]),
        updatePassword: jest.fn().mockResolvedValue(undefined),
        createAccount: jest.fn(),
      };
      const { adminSetPassword } = createCredentialHelpers(
        fakeInstance(adapter),
      );

      await adminSetPassword(42, 'newPlaintextPwd');

      expect(adapter.updatePassword).toHaveBeenCalledTimes(1);
      const [userId, encoded] = adapter.updatePassword.mock.calls[0];
      expect(userId).toBe(42);
      expect(typeof encoded).toBe('string');
      expect(encoded.startsWith(ARGON2ID_PREFIX)).toBe(true);
      expect(adapter.createAccount).not.toHaveBeenCalled();
    });

    it('inserts a credential row when none exists (oauth-only user)', async () => {
      const adapter = {
        findAccountByUserId: jest
          .fn()
          .mockResolvedValue([{ providerId: 'google', password: null }]),
        createAccount: jest.fn().mockResolvedValue(undefined),
        updatePassword: jest.fn(),
      };
      const { adminSetPassword } = createCredentialHelpers(
        fakeInstance(adapter),
      );

      await adminSetPassword(42, 'newPlaintextPwd');

      expect(adapter.createAccount).toHaveBeenCalledTimes(1);
      const arg = adapter.createAccount.mock.calls[0][0];
      expect(arg.userId).toBe(42);
      expect(arg.accountId).toBe('42');
      expect(arg.providerId).toBe('credential');
      expect(typeof arg.password).toBe('string');
      expect(arg.password.startsWith(ARGON2ID_PREFIX)).toBe(true);
      expect(adapter.updatePassword).not.toHaveBeenCalled();
    });

    it('rejects an empty password', async () => {
      const adapter = {
        findAccountByUserId: jest.fn(),
        updatePassword: jest.fn(),
        createAccount: jest.fn(),
      };
      const { adminSetPassword } = createCredentialHelpers(
        fakeInstance(adapter),
      );

      await expect(adminSetPassword(42, '')).rejects.toThrow(
        /password is required/,
      );
      expect(adapter.findAccountByUserId).not.toHaveBeenCalled();
    });

    it('rejects a missing userId', async () => {
      const adapter = {
        findAccountByUserId: jest.fn(),
        updatePassword: jest.fn(),
        createAccount: jest.fn(),
      };
      const { adminSetPassword } = createCredentialHelpers(
        fakeInstance(adapter),
      );

      await expect(adminSetPassword(null, 'pwd')).rejects.toThrow(
        /userId is required/,
      );
      expect(adapter.findAccountByUserId).not.toHaveBeenCalled();
    });
  });

  it('deleteCredentialAccount only deletes credential rows', async () => {
    const adapter = {
      findAccountByUserId: jest.fn().mockResolvedValue([
        { id: 'cred-1', providerId: 'credential' },
        { id: 'goog-1', providerId: 'google' },
      ]),
      deleteAccount: jest.fn().mockResolvedValue(undefined),
    };
    const { deleteCredentialAccount } = createCredentialHelpers(
      fakeInstance(adapter),
    );

    await deleteCredentialAccount(42);

    expect(adapter.deleteAccount).toHaveBeenCalledTimes(1);
    expect(adapter.deleteAccount).toHaveBeenCalledWith('cred-1');
  });

  it('deleteCredentialAccount is a no-op when no credential row exists', async () => {
    const adapter = {
      findAccountByUserId: jest
        .fn()
        .mockResolvedValue([{ id: 'goog-1', providerId: 'google' }]),
      deleteAccount: jest.fn(),
    };
    const { deleteCredentialAccount } = createCredentialHelpers(
      fakeInstance(adapter),
    );

    await deleteCredentialAccount(42);

    expect(adapter.deleteAccount).not.toHaveBeenCalled();
  });

  it('deleteOAuthAccount only deletes rows for the requested provider', async () => {
    const adapter = {
      findAccountByUserId: jest.fn().mockResolvedValue([
        { id: 'cred-1', providerId: 'credential' },
        { id: 'goog-1', providerId: 'google' },
        { id: 'fb-1', providerId: 'facebook' },
      ]),
      deleteAccount: jest.fn().mockResolvedValue(undefined),
    };
    const { deleteOAuthAccount } = createCredentialHelpers(
      fakeInstance(adapter),
    );

    await deleteOAuthAccount(42, 'facebook');

    expect(adapter.deleteAccount).toHaveBeenCalledTimes(1);
    expect(adapter.deleteAccount).toHaveBeenCalledWith('fb-1');
  });

  it('deleteOAuthAccount is a no-op when no row matches the provider', async () => {
    const adapter = {
      findAccountByUserId: jest.fn().mockResolvedValue([
        { id: 'cred-1', providerId: 'credential' },
        { id: 'goog-1', providerId: 'google' },
      ]),
      deleteAccount: jest.fn(),
    };
    const { deleteOAuthAccount } = createCredentialHelpers(
      fakeInstance(adapter),
    );

    await deleteOAuthAccount(42, 'facebook');

    expect(adapter.deleteAccount).not.toHaveBeenCalled();
  });

  it('deleteAllOAuthAccounts removes google and facebook rows but keeps credential', async () => {
    const adapter = {
      findAccountByUserId: jest.fn().mockResolvedValue([
        { id: 'cred-1', providerId: 'credential' },
        { id: 'goog-1', providerId: 'google' },
        { id: 'fb-1', providerId: 'facebook' },
      ]),
      deleteAccount: jest.fn().mockResolvedValue(undefined),
    };
    const { deleteAllOAuthAccounts } = createCredentialHelpers(
      fakeInstance(adapter),
    );

    await deleteAllOAuthAccounts(42);

    expect(adapter.deleteAccount).toHaveBeenCalledTimes(2);
    expect(adapter.deleteAccount).toHaveBeenCalledWith('goog-1');
    expect(adapter.deleteAccount).toHaveBeenCalledWith('fb-1');
  });

  it('revokeUserSessions delegates to deleteSessions with the userId as string', async () => {
    const adapter = { deleteSessions: jest.fn().mockResolvedValue(undefined) };
    const { revokeUserSessions } = createCredentialHelpers(
      fakeInstance(adapter),
    );

    await revokeUserSessions(99);

    expect(adapter.deleteSessions).toHaveBeenCalledWith('99');
  });

  it('refreshUserSessions delegates to updateUser with an empty patch (BA onUpdate fills updated_at) and the userId as string', async () => {
    const adapter = { updateUser: jest.fn().mockResolvedValue(undefined) };
    const { refreshUserSessions } = createCredentialHelpers(
      fakeInstance(adapter),
    );

    await refreshUserSessions(99);

    expect(adapter.updateUser).toHaveBeenCalledTimes(1);
    const [userId, data] = adapter.updateUser.mock.calls[0];
    expect(userId).toBe('99');
    expect(data).toEqual({});
  });

  describe('getAccountTypesByUserId', () => {
    it('returns a Map<userId, Set<providerId>> for a single id', async () => {
      const adapter = {
        findAccounts: jest.fn().mockResolvedValue([
          { providerId: 'credential', password: 'enc' },
          { providerId: 'google', password: null },
        ]),
      };
      const { getAccountTypesByUserId } = createCredentialHelpers(
        fakeInstance(adapter),
      );

      const result = await getAccountTypesByUserId(42);

      expect(adapter.findAccounts).toHaveBeenCalledWith(42);
      expect(result).toBeInstanceOf(Map);
      expect(result.get(42)).toEqual(new Set(['credential', 'google']));
    });

    it('fans out across an array of user ids', async () => {
      const byId = {
        1: [{ providerId: 'credential' }],
        2: [{ providerId: 'google' }],
        3: [],
      };
      const adapter = {
        findAccounts: jest.fn(async (id) => byId[id]),
      };
      const { getAccountTypesByUserId } = createCredentialHelpers(
        fakeInstance(adapter),
      );

      const result = await getAccountTypesByUserId([1, 2, 3]);

      expect(adapter.findAccounts).toHaveBeenCalledTimes(3);
      expect(result.get(1)).toEqual(new Set(['credential']));
      expect(result.get(2)).toEqual(new Set(['google']));
      expect(result.get(3)).toEqual(new Set());
    });

    it('returns an empty Map for an empty array (no I/O)', async () => {
      const adapter = { findAccounts: jest.fn() };
      const { getAccountTypesByUserId } = createCredentialHelpers(
        fakeInstance(adapter),
      );

      const result = await getAccountTypesByUserId([]);

      expect(adapter.findAccounts).not.toHaveBeenCalled();
      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });
  });
});
