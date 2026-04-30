import crypto from 'node:crypto';
import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';
import { getCredentialAccount } from './helpers/account.js';

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

function sha256Hex(salt, password) {
  return crypto
    .createHash('sha256')
    .update((salt ?? '') + password, 'utf-8')
    .digest('hex');
}

describe('15 - services.users dual-write legacy password (phase 2a)', () => {
  let core;
  let services;
  let knex;
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
    usersSvc = services.users;
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('users.create with password', () => {
    let user;

    beforeAll(async () => {
      user = await usersSvc.create(
        {
          fullName: 'Mirror Create',
          email: 'mirror-create@oa.test',
          password: 'plainPwd-create',
          isActivated: true,
        },
        {
          internal: true,
          detailed: true,
        },
      );
    });

    it('writes the matching credential account row', async () => {
      const account = await getCredentialAccount(
        knex,
        user.id,
        testConfig.schemas,
      );
      expect(account).toBeTruthy();
      expect(account.provider_id).toBe('credential');
      expect(account.account_id).toBe(String(user.id));
      // user_id may come back as string or number depending on the driver.
      expect(String(account.user_id)).toBe(String(user.id));
    });

    it('encodes the password as `legacy-sha256$salt$sha256(salt+pwd)`', async () => {
      const account = await getCredentialAccount(
        knex,
        user.id,
        testConfig.schemas,
      );
      const expectedHex = sha256Hex(user.salt, 'plainPwd-create');
      expect(account.password).toBe(
        services.auth.encodeLegacyPassword('sha256', user.salt, expectedHex),
      );
      expect(account.password).toBe(
        `legacy-sha256$${user.salt}$${expectedHex}`,
      );

      // The hex part is what `user.password` stores (post-hashPassword hook).
      const dbUser = await knex(testConfig.schemas.user)
        .where({ id: user.id })
        .first();
      expect(dbUser.password).toBe(expectedHex);
    });
  });

  describe('users.changePassword', () => {
    let user;

    beforeAll(async () => {
      user = await usersSvc.create(
        {
          fullName: 'Mirror Change',
          email: 'mirror-change@oa.test',
          password: 'initialPwd',
          isActivated: true,
        },
        {
          internal: true,
          detailed: true,
        },
      );
    });

    it('updates the existing credential row in place (no duplicates)', async () => {
      const before = await getCredentialAccount(
        knex,
        user.id,
        testConfig.schemas,
      );

      await usersSvc.changePassword(user.uid, {
        password: 'newPwd-change',
      });

      const accounts = await knex(testConfig.schemas.account).where({
        provider_id: 'credential',
        account_id: String(user.id),
      });
      expect(accounts).toHaveLength(1);

      const after = accounts[0];
      // Same row id — it was an update.
      expect(String(after.id)).toBe(String(before.id));

      const expectedHex = sha256Hex(user.salt, 'newPwd-change');
      expect(after.password).toBe(`legacy-sha256$${user.salt}$${expectedHex}`);
      expect(after.password).not.toBe(before.password);
    });
  });

  describe('users.patch internal with password', () => {
    let user;

    beforeAll(async () => {
      user = await usersSvc.create(
        {
          fullName: 'Mirror Patch',
          email: 'mirror-patch@oa.test',
          password: 'initialPwd',
          isActivated: true,
        },
        {
          internal: true,
          detailed: true,
        },
      );
    });

    it('mirrors a patch that supplies a hex 64 password (internal=true)', async () => {
      const hex = sha256Hex(user.salt, 'fromPatch');

      await usersSvc.patch(user.uid, { password: hex }, { internal: true });

      const account = await getCredentialAccount(
        knex,
        user.id,
        testConfig.schemas,
      );
      expect(account).toBeTruthy();
      expect(account.password).toBe(`legacy-sha256$${user.salt}$${hex}`);
    });
  });

  describe('users.patch internal without password (no-op)', () => {
    let user;
    let beforeRow;

    beforeAll(async () => {
      user = await usersSvc.create(
        {
          fullName: 'Mirror Patch Noop',
          email: 'mirror-patch-noop@oa.test',
          password: 'initialPwd',
          isActivated: true,
        },
        {
          internal: true,
          detailed: true,
        },
      );
      beforeRow = await getCredentialAccount(knex, user.id, testConfig.schemas);
    });

    it('does not touch the credential row when patch has no password', async () => {
      await usersSvc.patch(
        user.uid,
        { fullName: 'Renamed' },
        { internal: true },
      );

      const after = await getCredentialAccount(
        knex,
        user.id,
        testConfig.schemas,
      );
      expect(after).toBeTruthy();
      expect(after.password).toBe(beforeRow.password);
      expect(String(after.id)).toBe(String(beforeRow.id));
    });
  });

  describe('users.create external (salt stripped from result by keepFields)', () => {
    it('mirrors with the salt taken from data, not from the stripped result', async () => {
      const result = await usersSvc.create(
        {
          fullName: 'External Mirror',
          email: 'external-mirror@oa.test',
          password: 'externalPwd',
          isActivated: true,
        },
        {
          provider: 'rest',
          detailed: true,
        },
      );

      // keepFields() drops `salt` from external results.
      expect(result.salt).toBeUndefined();

      const dbUser = await knex(testConfig.schemas.user)
        .where({ id: result.id })
        .first();
      expect(dbUser.salt).toBeTruthy();

      const account = await getCredentialAccount(
        knex,
        result.id,
        testConfig.schemas,
      );
      expect(account).toBeTruthy();
      const expectedHex = sha256Hex(dbUser.salt, 'externalPwd');
      expect(account.password).toBe(
        `legacy-sha256$${dbUser.salt}$${expectedHex}`,
      );
    });
  });

  describe('users.create without password (oauth-only)', () => {
    it('does not insert a credential row when password is absent', async () => {
      const user = await usersSvc.create(
        {
          fullName: 'Oauth Only',
          email: 'oauth-only@oa.test',
          googleId: 'google-12345',
          isActivated: true,
        },
        {
          internal: true,
          detailed: true,
        },
      );

      expect(user).toBeTruthy();
      const account = await getCredentialAccount(
        knex,
        user.id,
        testConfig.schemas,
      );
      expect(account).toBeUndefined();
    });
  });
});
