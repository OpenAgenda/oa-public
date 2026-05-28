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
  'trackers',
];

describe('10 - core - functional (server): core.users().get()', () => {
  let core;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['011.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(testConfig, { enabled });

    core = Core(services, testConfig);

    await services.simpleCache.clearAll();
    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('authorizations', () => {
    it('if user is contributor in agenda having edit rights and is owner of event, user is authorized to edit event', async () => {
      expect(await core.users(8929606).canEditEvent(40740739)).toBe(true);
    });

    it('if user is moderator in agenda having edit rights, user is authorized to edit event', async () => {
      expect(await core.users(99999967).canEditEvent(40740739)).toBe(true);
    });
  });

  describe('with Schema', () => {
    it('schema can be retrieved with the user', async () => {
      const result = await core.users.get(8929606, { withSchema: true });

      expect(Object.keys(result)).toEqual(['data', 'schema']);
    });
  });

  describe('tokens', () => {
    it('user can be retrieved using a valid access token', async () => {
      const janine = await core.users.get.byAccessToken(
        '11a7946ddd256c768867ac3f2182cba0',
      );
      expect(janine.uid).toBe(1);
    });

    it('outdated access token throws error', async () => {
      let error;
      try {
        await core.users.get.byAccessToken('11a79182cddd2466c768867ac3f25ba0');
      } catch (e) {
        error = e.message;
      }
      expect(error).toBe('access token is expired');
    });

    it('user access token can be refreshed using the secret key', async () => {
      await testConfig
        .knex('access_token')
        .update({
          created_at: new Date(),
          lifespan: 100,
        })
        .where('id', 2);

      const token = await core
        .users({
          secretKey: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
        })
        .generateToken();

      expect(token.id).toBe(2);
      expect(token.lifespan).toBeGreaterThanOrEqual(3599);
    });

    it('new access token is created when previous is outdated', async () => {
      await testConfig
        .knex('access_token')
        .update({
          created_at: new Date(),
          lifespan: -1,
        })
        .where('id', 2);

      const token = await core
        .users({
          secretKey: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
        })
        .generateToken();

      expect(token.id).toBeGreaterThan(2);
      expect(token.lifespan).toBeGreaterThanOrEqual(3599);
    });
  });
});
