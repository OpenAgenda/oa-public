import axios from 'axios';
import api from '../api/index.mjs';
import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('10 - core - functional (server): core.users().remove()', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '018.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'tracker',
        'accessTokens',
        'files',
        'queues',
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
        'legacy',
        'users',
        'keys',
        'activities',
      ],
    });

    core = Core(services, testConfig);

    await services.simpleCache.clearAll();

    core.services.users.tasks.processQueue();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    let memberRefAfterRemove;
    beforeAll(async () => {
      await core.users(99999967).remove();

      await new Promise(rs => {
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
      server = await api(core).listen(3000);
    });

    afterAll(() => server.close());

    beforeAll(async () => {
      accessToken = await axios({
        method: 'post',
        url: 'http://localhost:3000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
        },
      }).then(r => r.data.access_token);
    });

    it('user can delete his own account', async () => {
      await axios({
        method: 'delete',
        url: 'http://localhost:3000/me',
        headers: {
          'access-token': accessToken,
          nonce: 1234,
          'content-type': 'application/json',
        },
      });

      await new Promise(rs => {
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
