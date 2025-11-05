import ky from 'ky';
import api from '../api/index.js';
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
  beforeAll(() => loadFixtures(config.db, '007.sql.js'));

  beforeAll(async () => {
    const services = await Services(config, {
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
      ],
    });

    core = Core(services, config);
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  it('updateMemberFields', async () => {
    await core
      .agendas(60935574)
      .settings.schema.updateMemberFields(
        [{ field: 'phone', optional: false }],
        { access: 'administrator' },
      );
    const result = await core.agendas(60935574).settings.schema.get();
    expect(result).toBeTruthy();
  });

  describe('api', () => {
    let server;
    const administratorKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';

    let adminAccessToken;
    let contribAccessToken;

    beforeAll(async () => {
      server = await api(core, { useRouter: false }).listen(4000);

      const adminTokenResponse = await ky
        .post('http://localhost:4000/requestAccessToken', {
          json: {
            code: 'N0ty3poxNSTt5KTzxPJHUG6896UseQhM',
          },
        })
        .json();
      adminAccessToken = adminTokenResponse.access_token;

      try {
        const contribTokenResponse = await ky
          .post('http://localhost:4000/requestAccessToken', {
            json: {
              code: 'STt5KTzxPJHUG6N0ty3poxN896UseQhM',
            },
          })
          .json();
        contribAccessToken = contribTokenResponse.access_token;
      } catch (e) {
        // console.log(e.response);
      }
    });

    afterAll(() => server.close());

    it('get settings memberSchema for configuration with adminKey', async () => {
      const res = await ky
        .get(
          `http://localhost:4000/agendas/60935574/settings/memberSchema/configure?key=${administratorKey}`,
        )
        .json();
      expect(res.parents.length).toBe(1);
      expect(res.schema).toBeTruthy();
    });

    it('get settings memberSchema for member with andminKey', async () => {
      const res = await ky
        .get(
          `http://localhost:4000/agendas/60935574/settings/memberSchema?key=${administratorKey}`,
        )
        .json();
      expect(res.merged.fields).toBeTruthy();
    });

    it('succesfull post memberSchema from adminUser', async () => {
      let result;
      try {
        result = await ky
          .post(
            'http://localhost:4000/agendas/60935574/settings/memberSchema/configure',
            {
              headers: {
                'access-token': adminAccessToken,
              },
              json: {
                fields: [{ field: 'phone', optional: false }],
              },
            },
          )
          .json();
      } catch (error) {
        // console.log(error);
      }
      expect(result).toBeTruthy();
    });

    it('unsuccessfull post memberSchema from contrib', async () => {
      const response = await ky
        .post(
          'http://localhost:4000/agendas/60935574/settings/memberSchema/configure',
          {
            headers: {
              'access-token': contribAccessToken,
            },
            json: {
              fields: [{ field: 'phone', optional: false }],
            },
          },
        )
        .json()
        .then(
          () => {},
          (err) => err.response,
        );
      expect(response.status).toBe(403);
    });
  });
});
