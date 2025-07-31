import axios from 'axios';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';

import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('07 - core - functional (server): core.agendas().create', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '008.sql.js'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'bull',
        'files',
        'events',
        'accessTokens',
        'agendas',
        'aggregators',
        'agendaEvents',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'users',
        'keys',
        'tracker',
      ],
    });

    core = Core(services, testConfig);
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('core', () => {
    describe('basic case', () => {
      let agenda;

      beforeAll(async () => {
        try {
          agenda = await core.agendas.create(
            {
              title: 'Un agenda',
              description: 'pour tester la création',
            },
            { userUid: 63170203 },
          );
        } catch (e) {
          console.log(JSON.stringify(e, null, 2));
        }
      });

      it('agenda is created', async () => {
        expect(agenda.title).toBe('Un agenda');
      });

      it('user is administrator of agenda', async () => {
        const member = await core
          .agendas(agenda.uid)
          .members.get(63170203, { access: 'internal' });

        expect(member.role).toBe('administrator');
      });
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
      accessToken = await axios({
        method: 'post',
        url: 'http://localhost:4000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
        },
      }).then((r) => r.data.access_token);
    });

    test('basic create', async () => {
      const response = await axios({
        method: 'post',
        url: 'http://localhost:4000/agendas',
        headers: {
          'access-token': accessToken,
          'content-type': 'application/json',
        },
        data: {
          title: 'Un agenda créé via API',
          description: 'Test',
        },
      });

      expect(response.data.title).toBe('Un agenda créé via API');
    });
  });
});
