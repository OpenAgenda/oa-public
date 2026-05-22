import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';
import { getAllAccounts, getCredentialAccount } from './helpers/account.js';

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'accessTokens',
  'files',
  'bull',
  'events',
  'agendas',
  'agendaEvents',
  'agendaLocations',
  'formSchemas',
  'custom',
  'eventSearch',
  'members',
  'networks',
  'users',
  'keys',
  'trackers',
  'abilities',
  'invitations',
  'mails',
  'unsubscriptions',
  'activities',
  'inboxes',
  'behavioralEmails',
  'genUrl',
  'errors',
];

const KEY_PREFIX = '{better-auth}:';

async function seedFakeSession(redis, userId, token = 'fake-token') {
  const expiresAt = Date.now() + 60_000;
  await redis.set(
    `${KEY_PREFIX}active-sessions-${userId}`,
    JSON.stringify([{ token, expiresAt }]),
  );
  await redis.set(
    `${KEY_PREFIX}${token}`,
    JSON.stringify({ userId, expiresAt }),
  );
  return token;
}

describe('16 - services.users account cleanup (phase 2.5)', () => {
  let core;
  let services;
  let knex;
  let redis;
  let usersSvc;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: [],
    });
  });

  beforeAll(async () => {
    services = await Services(testConfig, { enabled });
    core = Core(services, testConfig);
    knex = services.knex;
    redis = services.redis;
    usersSvc = services.users;
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('users.remove', () => {
    it('deletes the credential account row', async () => {
      const user = await usersSvc.create(
        {
          fullName: 'Cleanup Remove',
          email: 'cleanup-remove@oa.test',
          password: 'plainPwd-remove',
          isActivated: true,
        },
        { internal: true, detailed: true },
      );

      // Sanity: phase 2a wrote the row.
      const beforeRow = await getCredentialAccount(
        knex,
        user.id,
        testConfig.schemas,
      );
      expect(beforeRow).toBeTruthy();

      await usersSvc.remove(user.uid);

      const afterRow = await getCredentialAccount(
        knex,
        user.id,
        testConfig.schemas,
      );
      expect(afterRow).toBeUndefined();

      // Sanity: the user is soft-removed (the actual user row stays).
      const dbUser = await knex(testConfig.schemas.user)
        .where({ id: user.id })
        .first();
      expect(dbUser.is_removed).toBe(1);
    });

    it('purges the better-auth session keys from Redis', async () => {
      const user = await usersSvc.create(
        {
          fullName: 'Cleanup Sessions',
          email: 'cleanup-sessions@oa.test',
          password: 'plainPwd-sessions',
          isActivated: true,
        },
        { internal: true, detailed: true },
      );

      const token = await seedFakeSession(redis, user.id);

      await usersSvc.remove(user.uid);

      expect(
        await redis.get(`${KEY_PREFIX}active-sessions-${user.id}`),
      ).toBeNull();
      expect(await redis.get(`${KEY_PREFIX}${token}`)).toBeNull();
    });

    it('cascades to OAuth account rows (google + facebook)', async () => {
      const user = await usersSvc.create(
        {
          fullName: 'Cleanup OAuth Cascade',
          email: 'cleanup-oauth-cascade@oa.test',
          password: 'plainPwd-oauth',
          isActivated: true,
        },
        { internal: true, detailed: true },
      );

      // Mimic phase 4 backfill: insert OAuth account rows alongside the
      // credential row written by phase 2a.
      const now = new Date();
      await knex(testConfig.schemas.account).insert([
        {
          user_id: user.id,
          account_id: 'google-uid-cascade',
          provider_id: 'google',
          password: null,
          created_at: now,
          updated_at: now,
        },
        {
          user_id: user.id,
          account_id: 'facebook-uid-cascade',
          provider_id: 'facebook',
          password: null,
          created_at: now,
          updated_at: now,
        },
      ]);
      expect(
        await getAllAccounts(knex, user.id, testConfig.schemas),
      ).toHaveLength(3);

      await usersSvc.remove(user.uid);

      expect(
        await getAllAccounts(knex, user.id, testConfig.schemas),
      ).toHaveLength(0);
    });

    it('does not throw when the user has no credential row (oauth-only)', async () => {
      const user = await usersSvc.create(
        {
          fullName: 'OAuth Only Cleanup',
          email: 'oauth-cleanup@oa.test',
          googleId: 'google-cleanup-1',
          isActivated: true,
        },
        { internal: true, detailed: true },
      );

      // Pre-condition: phase 2a never wrote a credential row.
      expect(
        await getCredentialAccount(knex, user.id, testConfig.schemas),
      ).toBeUndefined();

      await expect(usersSvc.remove(user.uid)).resolves.toBeDefined();

      const dbUser = await knex(testConfig.schemas.user)
        .where({ id: user.id })
        .first();
      expect(dbUser.is_removed).toBe(1);
    });
  });

  describe('users.patch isBlacklisted=true (internal)', () => {
    it('revokes sessions but keeps the credential row', async () => {
      const user = await usersSvc.create(
        {
          fullName: 'Blacklist Me',
          email: 'blacklist-me@oa.test',
          password: 'plainPwd-blacklist',
          isActivated: true,
        },
        { internal: true, detailed: true },
      );
      const token = await seedFakeSession(redis, user.id);

      await usersSvc.patch(
        user.uid,
        { isBlacklisted: true },
        { internal: true },
      );

      // Account row preserved (blacklist is reversible).
      const account = await getCredentialAccount(
        knex,
        user.id,
        testConfig.schemas,
      );
      expect(account).toBeTruthy();

      // Sessions purged.
      expect(
        await redis.get(`${KEY_PREFIX}active-sessions-${user.id}`),
      ).toBeNull();
      expect(await redis.get(`${KEY_PREFIX}${token}`)).toBeNull();
    });
  });

  describe('users.patch isBlacklisted=true on already-blacklisted user', () => {
    it('does not re-purge sessions on the no-op transition true→true', async () => {
      const user = await usersSvc.create(
        {
          fullName: 'Already Blacklisted',
          email: 'already-blacklisted@oa.test',
          password: 'plainPwd-already',
          isActivated: true,
        },
        { internal: true, detailed: true },
      );
      // Pre-set is_blacklisted in DB so params.before.isBlacklisted is true.
      await knex(testConfig.schemas.user)
        .where({ id: user.id })
        .update({ is_blacklisted: 1 });

      const token = await seedFakeSession(redis, user.id);

      await usersSvc.patch(
        user.uid,
        { isBlacklisted: true },
        { internal: true },
      );

      expect(
        await redis.get(`${KEY_PREFIX}active-sessions-${user.id}`),
      ).not.toBeNull();
      expect(await redis.get(`${KEY_PREFIX}${token}`)).not.toBeNull();
    });
  });

  describe('users.patch isBlacklisted=false (lifting blacklist)', () => {
    it('does not touch account row or sessions', async () => {
      const user = await usersSvc.create(
        {
          fullName: 'Unblacklist Me',
          email: 'unblacklist-me@oa.test',
          password: 'plainPwd-unblacklist',
          isActivated: true,
        },
        { internal: true, detailed: true },
      );
      await knex(testConfig.schemas.user)
        .where({ id: user.id })
        .update({ is_blacklisted: 1 });

      const token = await seedFakeSession(redis, user.id);

      await usersSvc.patch(
        user.uid,
        { isBlacklisted: false },
        { internal: true },
      );

      const account = await getCredentialAccount(
        knex,
        user.id,
        testConfig.schemas,
      );
      expect(account).toBeTruthy();

      expect(
        await redis.get(`${KEY_PREFIX}active-sessions-${user.id}`),
      ).not.toBeNull();
      expect(await redis.get(`${KEY_PREFIX}${token}`)).not.toBeNull();
    });
  });

  // External patches with `isBlacklisted` never reach this hook
  // (restrictToCurrentUserIfExternal + keep() filter upstream).

  describe('users.patch unrelated field', () => {
    it('does not touch sessions when isBlacklisted is not in the patch', async () => {
      const user = await usersSvc.create(
        {
          fullName: 'Patch Noop',
          email: 'patch-noop@oa.test',
          password: 'plainPwd-noop',
          isActivated: true,
        },
        { internal: true, detailed: true },
      );
      const token = await seedFakeSession(redis, user.id);

      await usersSvc.patch(
        user.uid,
        { fullName: 'Renamed Noop' },
        { internal: true },
      );

      expect(
        await redis.get(`${KEY_PREFIX}active-sessions-${user.id}`),
      ).not.toBeNull();
      expect(await redis.get(`${KEY_PREFIX}${token}`)).not.toBeNull();
    });
  });
});
