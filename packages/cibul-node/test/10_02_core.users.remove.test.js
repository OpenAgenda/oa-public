import ky from 'ky';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import setup from './fixtures/setup.js';
import testConfig from './testConfig.js';

const enabled = [
  'knex',
  'redis',
  'auth',
  'simpleCache',
  'tracker',
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
  'activities',
];

describe('10 - core - functional (server): core.users().remove()', () => {
  let core;

  beforeAll(async () => {
    await setup({
      mysql: testConfig.db,
      schemas: testConfig.schemas,
      enabled,
      data: ['018.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(testConfig, { enabled });

    core = Core(services, testConfig);

    await core.services.eventSearch
      .getConfig()
      .client.indices.delete({
        index: 'test',
      })
      .catch(() => null);

    await core.agendas(6184770).events.search.rebuild();
    await services.simpleCache.clearAll();
    await services.formSchemas.clearCache();

    core.services.users.tasks.processQueue();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    let memberRefAfterRemove;
    beforeAll(async () => {
      await core.users(99999967).remove();

      await new Promise((rs) => {
        core.services.tracker.on('users.anonymizeDeletedUser.done', rs);
      });

      memberRefAfterRemove = await core.agendas(6184770).members.get(99999967, {
        access: 'internal',
        detailed: true,
      });
    });

    it('user is marked as removed', async () => {
      const user = await core.services.users.findOne({
        query: { uid: 99999967 },
        removed: null,
        detailed: true,
      });

      expect(user.isRemoved).toBe(true);
    });

    it('member ref marks user as having been removed', () => {
      expect(memberRefAfterRemove.deletedUser).toBe(true);
    });

    it('user member refs are anonymized', () => {
      expect(memberRefAfterRemove.name).toBeNull();
    });

    it('member organization is maintained', () => {
      expect(memberRefAfterRemove.organization).toBe('FdP');
    });

    it('related activities are anonymized', async () => {
      const activities = await core.services.activities.activities.list({
        entityType: 'user',
        entityUid: 99999967,
      });
      expect(activities[0].store.labels.actor).toBe('$__deleted');
    });
  });

  describe('api', () => {
    let server;
    let accessToken;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      const tokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
          },
        })
        .json();
      accessToken = tokenResponse.access_token;
    });

    it('user can delete his own account', async () => {
      await ky.delete('http://localhost:4000/me', {
        headers: {
          'access-token': accessToken,
        },
      });

      await new Promise((rs) => {
        core.services.tracker.on('users.anonymizeDeletedUser.done', rs);
      });

      const user = await core.services.users.findOne({
        query: { uid: 8929606 },
        removed: null,
        detailed: true,
      });

      expect(user.isRemoved).toBe(true);
    });
  });
});
