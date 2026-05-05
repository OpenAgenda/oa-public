import { jest } from '@jest/globals';
import Auth from '../src/index.js';

// Stub mysql pool — Auth() validates `mysqlPool` is present but doesn't
// touch it during these tests (we only exercise the wrapper functions, which
// would only reach the DB / Redis if their input validation passed).
const fakeMysqlPool = { query: jest.fn() };

function makeFakeRes() {
  const headers = {};
  return {
    headers,
    setHeader(key, value) {
      headers[key] = value;
    },
    getHeader(key) {
      return headers[key];
    },
  };
}

describe('auth - impersonation factory exports', () => {
  const secret = 'test-secret-do-not-use-in-prod-just-long-enough';

  it('exposes impersonateUser and stopImpersonating as functions', () => {
    const auth = Auth({ mysqlPool: fakeMysqlPool, secret });
    expect(typeof auth.impersonateUser).toBe('function');
    expect(typeof auth.stopImpersonating).toBe('function');
    // openSession is the generic primitive used by /signin (OAuth / legacy
    // aa-token activation fallback) — still a top-level export.
    expect(typeof auth.openSession).toBe('function');
  });

  it('removes the homemade impersonation helpers from the factory output', () => {
    const auth = Auth({ mysqlPool: fakeMysqlPool, secret });
    expect(auth.createImpersonationSession).toBeUndefined();
    expect(auth.verifyImpersonatedByCookie).toBeUndefined();
    expect(auth.clearImpersonatedByCookie).toBeUndefined();
    expect(auth.impersonatedByCookieName).toBeUndefined();
  });

  describe('openSession', () => {
    it('throws when res is missing', async () => {
      const auth = Auth({ mysqlPool: fakeMysqlPool, secret });
      await expect(auth.openSession({ userId: 1 })).rejects.toThrow(
        /res is required/,
      );
    });

    it('throws when userId is missing', async () => {
      const auth = Auth({ mysqlPool: fakeMysqlPool, secret });
      await expect(auth.openSession({ res: makeFakeRes() })).rejects.toThrow(
        /userId is required/,
      );
    });
  });

  describe('impersonateUser', () => {
    it('throws when res is missing', async () => {
      const auth = Auth({ mysqlPool: fakeMysqlPool, secret });
      await expect(
        auth.impersonateUser({ targetUserId: 1, req: { headers: {} } }),
      ).rejects.toThrow(/res is required/);
    });

    it('throws when targetUserId is missing', async () => {
      const auth = Auth({ mysqlPool: fakeMysqlPool, secret });
      await expect(
        auth.impersonateUser({ req: { headers: {} }, res: makeFakeRes() }),
      ).rejects.toThrow(/targetUserId is required/);
    });
  });

  describe('stopImpersonating', () => {
    it('throws when res is missing', async () => {
      const auth = Auth({ mysqlPool: fakeMysqlPool, secret });
      await expect(
        auth.stopImpersonating({ req: { headers: {} } }),
      ).rejects.toThrow(/res is required/);
    });
  });
});
