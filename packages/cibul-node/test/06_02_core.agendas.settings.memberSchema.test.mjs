import axios from 'axios';
import api from '../api/index.mjs';
import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core - functional (server): core.agendas().settings.schema.memberSchema', () => {
  let core;

  const config = testConfig.extendWith({
    cachePrefix: 'c06_02_core_agendas_settings_schema_memberSchema_test',
    queuesPrefix: 'q06_02:',
  });
  beforeAll(() => loadFixtures(config.db, '007.sql'));

  beforeAll(async () => {
    const services = await Services(config, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'queues',
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
        'legacy',
        'users',
        'keys',
      ],
    });

    core = Core(services, config);
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  it('updateMemberFields', async () => {
    await core.agendas(60935574).settings.schema.updateMemberFields([{ field: 'phone', optional: false }], { access: 'administrator' });
    const result = await core.agendas(60935574).settings.schema.get();
    expect(result).toBeTruthy();
  });

  describe('api', () => {
    let server;
    const administratorKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';

    let adminAccessToken;
    let contribAccessToken;

    beforeAll(async () => {
      server = await api(core).listen(3000);

      adminAccessToken = await axios({
        method: 'post',
        url: 'http://localhost:3000/requestAccessToken',
        headers: {
          'content-type': 'application/json',
        },
        data: {
          code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
        },
      }).then(r => r.data.access_token);

      try {
        contribAccessToken = await axios({
          method: 'post',
          url: 'http://localhost:3000/requestAccessToken',
          headers: {
            'content-type': 'application/json',
          },
          data: {
            code: 'STt5KTzxPJHUG6N0ty3poxN896UseQhM',
          },
        }).then(r => r.data.access_token);
      } catch (e) {
        // console.log(e.response);
      }
    });

    afterAll(() => server.close());

    it('get settings memberSchema for configuration with adminKey', async () => {
      const res = await axios.get(`http://localhost:3000/agendas/60935574/settings/memberSchema/configure?key=${administratorKey}`, { params: {} });
      expect(res.data.parents.length).toBe(1);
      expect(res.data.schema).toBeTruthy();
    });

    it('get settings memberSchema for member with andminKey', async () => {
      const res = await axios.get(`http://localhost:3000/agendas/60935574/settings/memberSchema?key=${administratorKey}`, { params: {} });
      expect(res.data.merged.fields).toBeTruthy();
    });

    it('succesfull post memberSchema from adminUser', async () => {
      let result;
      try {
        result = await axios({
          method: 'post',
          url: 'http://localhost:3000/agendas/60935574/settings/memberSchema/configure',
          headers: {
            'access-token': adminAccessToken,
            nonce: 1238979,
            'content-type': 'application/json',
          },
          data: {
            fields: [
              { field: 'phone', optional: false },
            ],
          },
        });
      } catch (error) {
        // console.log(error);
      }
      expect(result.data).toBeTruthy();
    });

    it('unsuccessfull post memberSchema from contrib', async () => {
      let response;
      try {
        await axios({
          method: 'post',
          url: 'http://localhost:3000/agendas/60935574/settings/memberSchema/configure',
          headers: {
            'access-token': contribAccessToken,
            nonce: 1238980,
            'content-type': 'application/json',
          },
          data: {
            fields: [
              { field: 'phone', optional: false },
            ],
          },
        });
      } catch (error) {
        response = error.response;
      }
      expect(response.status).toBe(403);
    });
  });
});
