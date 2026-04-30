import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

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
  'sessions',
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

async function getCredentialAccount(knex, userId) {
  return knex(testConfig.schemas.account)
    .where({
      provider_id: 'credential',
      account_id: String(userId),
    })
    .first();
}

describe('17 - services.users sign-in legacy rehash + guard (phase 2b)', () => {
  let core;
  let services;
  let knex;
  let usersSvc;
  let auth;

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
    usersSvc = services.users;
    auth = services.auth;
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('sign-in /sign-in/email', () => {
    it('rehashes a legacy sha256 row to argon2id on first successful sign-in', async () => {
      const email = 'rehash-me@oa.test';
      const password = 'plainPwd-rehash';
      const user = await usersSvc.create(
        {
          fullName: 'Rehash Me',
          email,
          password,
          isActivated: true,
        },
        { internal: true, detailed: true },
      );

      const before = await getCredentialAccount(knex, user.id);
      expect(before.password.startsWith('legacy-sha256$')).toBe(true);

      const res = await auth.api.signInEmail({ body: { email, password } });
      expect(res.token).toBeTruthy();

      const after = await getCredentialAccount(knex, user.id);
      expect(after.password.startsWith('$argon2id$')).toBe(true);

      // A second sign-in still works (verify accepts argon2id) and the hash
      // is not rotated again.
      const res2 = await auth.api.signInEmail({ body: { email, password } });
      expect(res2.token).toBeTruthy();
      const after2 = await getCredentialAccount(knex, user.id);
      expect(after2.password).toBe(after.password);
    });

    it('rejects sign-in with the wrong password (legacy hash)', async () => {
      const email = 'wrong-pw@oa.test';
      const password = 'plainPwd-wrong';
      await usersSvc.create(
        {
          fullName: 'Wrong PW',
          email,
          password,
          isActivated: true,
        },
        { internal: true, detailed: true },
      );

      await expect(
        auth.api.signInEmail({ body: { email, password: 'nope' } }),
      ).rejects.toThrow();
    });

    it('rejects sign-in for a blacklisted user even with the right password', async () => {
      const email = 'blacklisted-signin@oa.test';
      const password = 'plainPwd-bl';
      const user = await usersSvc.create(
        {
          fullName: 'Blacklisted Signin',
          email,
          password,
          isActivated: true,
        },
        { internal: true, detailed: true },
      );
      // Phase 2.5 keeps the credential row on blacklist; this is what the
      // hooks.before guard exists for.
      await knex(testConfig.schemas.user)
        .where({ id: user.id })
        .update({ is_blacklisted: 1 });

      await expect(
        auth.api.signInEmail({ body: { email, password } }),
      ).rejects.toThrow();

      // The guard ran before sign-in completed, so no rehash should have
      // happened.
      const account = await getCredentialAccount(knex, user.id);
      expect(account.password.startsWith('legacy-sha256$')).toBe(true);
    });

    it('rejects sign-in for a soft-removed user', async () => {
      const email = 'removed-signin@oa.test';
      const password = 'plainPwd-rm';
      const user = await usersSvc.create(
        {
          fullName: 'Removed Signin',
          email,
          password,
          isActivated: true,
        },
        { internal: true, detailed: true },
      );
      // Phase 2.5 deletes the credential row on remove, so the natural
      // failure path is "credential account not found". The hooks.before
      // guard is defense-in-depth in case the row is somehow still there.
      await usersSvc.remove(user.uid);

      await expect(
        auth.api.signInEmail({ body: { email, password } }),
      ).rejects.toThrow();
    });
  });
});
