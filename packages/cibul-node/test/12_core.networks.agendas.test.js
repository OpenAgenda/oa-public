import axios from 'axios';
import Services from '../services/init.js';
import Core from '../core/index.js';
import api from '../api/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('12 - core - functional (server): core.networks().agendas', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '013.sql.js'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
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
        'users',
        'keys',
      ],
    });

    core = Core(services, testConfig);
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core.networks.agendas.add', () => {
    describe('successful', () => {
      let result;

      beforeAll(async () => {
        result = await core.networks(1).agendas.add(3);
      });

      it('result is updated agenda', () => {
        expect(result.uid).toBe(3);
      });

      it('network reference is included in response', () => {
        expect(result.networkUid).toBe(1);
      });

      it('db entry has network reference', async () => {
        const entry = await testConfig
          .knex('review')
          .first(['network_uid'])
          .where('uid', 3);

        expect(entry.network_uid).toBe(1);
      });
    });

    describe('fail due to Agenda already being associated to a network', () => {
      let error;

      beforeAll(async () => {
        try {
          await core.networks(1).agendas.add(1);
        } catch (e) {
          error = e;
        }
      });

      it('error name is BadRequest', () => {
        expect(error.name).toBe('BadRequest');
      });

      it('error provides detailed message', () => {
        expect(error.message).toBe('agenda is already in the network');
      });
    });
  });

  describe('core.networks.agendas.remove', () => {
    describe('successful', () => {
      let result;

      beforeAll(async () => {
        result = await core.networks(1).agendas.remove(2);
      });

      it('result is updated agenda', () => {
        expect(result.uid).toBe(2);
      });

      it('network reference has been removed from agenda', () => {
        expect(result.networkUid).toBe(null);
      });

      it('db entry for agenda no longer holds network reference', async () => {
        const entry = await testConfig
          .knex('review')
          .first(['network_uid'])
          .where('uid', 2);

        expect(entry.network_uid).toBe(null);
      });
    });

    describe('fail for not being part of agenda', () => {
      let error;

      beforeAll(async () => {
        try {
          await core.networks(1).agendas.remove(11);
        } catch (e) {
          error = e;
        }
      });

      it('error name is BadRequest', () => {
        expect(error.name).toBe('BadRequest');
      });

      it('error provides detailed message', () => {
        expect(error.message).toBe('agenda is not in network');
      });
    });
  });

  describe('api', () => {
    let server;
    let accessToken;
    const superAdminSecret = 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM';
    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);
      accessToken = await axios({
        method: 'post',
        url: 'http://localhost:4000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: superAdminSecret,
        },
      }).then((r) => r.data.access_token);
    });

    afterAll(() => server.close());
    it('agenda creation', async () => {
      const resp = await axios({
        method: 'post',
        url: 'http://localhost:4000/networks/1/agendas',
        headers: {
          'access-token': accessToken,
          'content-type': 'application/json',
        },
        data: {
          title: 'new agenda',
          description: 'new agenda description',
        },
      }).then((r) => r.data);

      expect(resp.title).toBe('new agenda');
    });
  });
});
