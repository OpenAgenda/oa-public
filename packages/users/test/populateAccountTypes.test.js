// Unit tests for `populateAccountTypes`. Two paths are covered:
//   - legacy fallback (no `interfaces.getAccountTypes` wired) — reads the
//     `user.{password, facebook_uid, twitter_id, google_id}` columns. This
//     branch is what the standalone `@openagenda/users` test config uses.
//   - BA-backed path (`interfaces.getAccountTypes` provided) — reads the
//     `account` table via the auth helper. Source of truth for cibul-node:
//     legacy columns are stale for BA-only users (signup direct via
//     better-auth, OAuth signup) so the legacy branch reports `false` for
//     `hasLocalAccount` / `hasSocialAccount` to wrong.
import populateAccountTypes from '../hooks/populateAccountTypes.js';

function track(fn) {
  const calls = [];
  const wrapped = async (...args) => {
    calls.push(args);
    return fn(...args);
  };
  wrapped.calls = calls;
  return wrapped;
}

function makeContext({ result, getEntity, interfaces, method = 'get' } = {}) {
  const service = {
    config: { interfaces: interfaces ?? {} },
    get: getEntity ?? (async () => ({})),
  };
  return {
    self: service,
    result,
    type: 'after',
    method,
    params: {},
  };
}

describe('populateAccountTypes', () => {
  describe('legacy fallback (no interfaces.getAccountTypes)', () => {
    it('reports hasLocalAccount when user.password is set', async () => {
      const record = { uid: 1 };
      const ctx = makeContext({
        result: record,
        getEntity: async () => ({
          password: 'sha1hash',
          facebook_uid: null,
          twitter_id: null,
          google_id: null,
        }),
      });

      await populateAccountTypes()(ctx);

      expect(record.hasLocalAccount).toBe(true);
      expect(record.hasSocialAccount).toBe(false);
    });

    it('reports hasSocialAccount when facebook_uid is set', async () => {
      const record = { uid: 2 };
      const ctx = makeContext({
        result: record,
        getEntity: async () => ({
          password: '',
          facebook_uid: '12345',
          twitter_id: null,
          google_id: null,
        }),
      });

      await populateAccountTypes()(ctx);

      expect(record.hasLocalAccount).toBe(false);
      expect(record.hasSocialAccount).toBe(true);
    });
  });

  describe('BA-backed path (interfaces.getAccountTypes wired)', () => {
    it('marks BA-only signup-via-credential as hasLocalAccount=true', async () => {
      // The BUG fixed: a user that signed up via better-auth has
      // `account.providerId='credential'` but `user.password=NULL`. Legacy
      // fallback would read `password=NULL` and report `false`.
      const record = { uid: 9001 };
      const getAccountTypes = track(
        async () => new Map([[42, new Set(['credential'])]]),
      );
      const ctx = makeContext({
        result: record,
        getEntity: async () => ({ id: 42 }),
        interfaces: { getAccountTypes },
      });

      await populateAccountTypes()(ctx);

      expect(getAccountTypes.calls).toEqual([[[42]]]);
      expect(record.hasLocalAccount).toBe(true);
      expect(record.hasSocialAccount).toBe(false);
    });

    it('marks BA-OAuth-only signup as hasSocialAccount=true', async () => {
      // BUG fixed: a user signed up via Google OAuth has
      // `account.providerId='google'` but `user.google_id=NULL` (BA does not
      // mirror back). Legacy fallback would report `false`.
      const record = { uid: 9002 };
      const getAccountTypes = track(
        async () => new Map([[43, new Set(['google'])]]),
      );
      const ctx = makeContext({
        result: record,
        getEntity: async () => ({ id: 43 }),
        interfaces: { getAccountTypes },
      });

      await populateAccountTypes()(ctx);

      expect(record.hasLocalAccount).toBe(false);
      expect(record.hasSocialAccount).toBe(true);
    });

    it('legacy dual-state (legacy password + BA credential mirror) stays hasLocalAccount=true', async () => {
      const record = { uid: 9003 };
      const getAccountTypes = track(
        async () => new Map([[44, new Set(['credential'])]]),
      );
      const ctx = makeContext({
        result: record,
        getEntity: async () => ({ id: 44 }),
        interfaces: { getAccountTypes },
      });

      await populateAccountTypes()(ctx);

      expect(record.hasLocalAccount).toBe(true);
    });

    it('handles list result shape (find — `{data, total}`)', async () => {
      const records = [{ uid: 11 }, { uid: 22 }];
      const getAccountTypes = track(
        async () =>
          new Map([
            [110, new Set(['credential'])],
            [220, new Set(['google', 'facebook'])],
          ]),
      );
      const ctx = makeContext({
        method: 'find',
        result: { data: records, total: 2 },
        getEntity: async (uid) => ({ id: uid * 10 }),
        interfaces: { getAccountTypes },
      });

      await populateAccountTypes()(ctx);

      expect(records[0].hasLocalAccount).toBe(true);
      expect(records[0].hasSocialAccount).toBe(false);
      expect(records[1].hasLocalAccount).toBe(false);
      expect(records[1].hasSocialAccount).toBe(true);
    });

    it('handles bare-array result shape (find without pagination)', async () => {
      const records = [{ uid: 33 }];
      const getAccountTypes = track(
        async () => new Map([[330, new Set(['credential', 'google'])]]),
      );
      const ctx = makeContext({
        method: 'find',
        result: records,
        getEntity: async () => ({ id: 330 }),
        interfaces: { getAccountTypes },
      });

      await populateAccountTypes()(ctx);

      expect(records[0].hasLocalAccount).toBe(true);
      expect(records[0].hasSocialAccount).toBe(true);
    });

    it('returns hasLocalAccount=false / hasSocialAccount=false when no provider rows', async () => {
      const record = { uid: 9004 };
      const getAccountTypes = track(async () => new Map([[55, new Set()]]));
      const ctx = makeContext({
        result: record,
        getEntity: async () => ({ id: 55 }),
        interfaces: { getAccountTypes },
      });

      await populateAccountTypes()(ctx);

      expect(record.hasLocalAccount).toBe(false);
      expect(record.hasSocialAccount).toBe(false);
    });

    it('skips when context.result is null', async () => {
      let called = false;
      const getAccountTypes = async () => {
        called = true;
        return new Map();
      };
      const ctx = makeContext({
        result: null,
        interfaces: { getAccountTypes },
      });

      await populateAccountTypes()(ctx);

      expect(called).toBe(false);
    });
  });
});
