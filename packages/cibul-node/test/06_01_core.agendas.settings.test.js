import ky from 'ky';
import api from '../api/index.js';
import Services from '../services/init.js';
import Core from '../core/index.js';
import testConfig from './testConfig.js';
import setup from './fixtures/setup.js';

const enabled = [
  'knex',
  'redis',
  'auth',
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
  'tracker',
];

describe('core - functional (server): core.agendas().settings.get()', () => {
  let core;
  const config = testConfig.extendWith({
    cachePrefix: 'c06_01_core_agendas_settings_test',
  });

  beforeAll(async () => {
    await setup({
      mysql: config.db,
      schemas: config.schemas,
      enabled,
      data: ['007.sql.js'],
    });
  });

  beforeAll(async () => {
    const services = await Services(config, { enabled });

    core = Core(services, testConfig);

    await services.formSchemas.clearCache();
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  it('get field configuration of an agenda not linked to a network', async () => {
    const result = await core
      .agendas(60934473)
      .settings.get({ access: 'internal' });

    expect(result.fields.map((f) => f.field)).toEqual([
      'entreelibre',
      'thematiques-metropolitaines',
      'types-devenements',
      'public',
      'organisateur',
      'tag-group-4',
      'cle_session',
      'category-group',
    ]);
  });

  it('get field configuration of an agenda linked to a network', async () => {
    const result = await core.agendas(60935574).settings.get({
      access: 'internal',
    });

    expect(result.fields.map((f) => f.field)).toEqual([
      'entreelibre',
      'thematiques-metropolitaines',
      'types-devenements',
      'public',
      'organisateur',
      'tag-group-4',
      'cle_session',
      'category-group',
      'edition',
    ]);
  });

  it('get schemas', async () => {
    const result = await core.agendas(60935574).settings.schema.getAndParents({
      access: 'internal',
      lang: 'en',
    });
    expect(result.schema.fields.map((f) => f.field)).toEqual([
      'entreelibre',
      'thematiques-metropolitaines',
      'types-devenements',
      'public',
      'organisateur',
      'tag-group-4',
      'cle_session',
      'category-group',
    ]);
    expect(result.parents.length).toBe(2);
  });

  it('updateEventsFields', async () => {
    await core
      .agendas(60935574)
      .settings.schema.updateFields([
        { field: 'entreelibre', optional: false },
      ]);
    const result = await core.agendas(60935574).settings.schema.get();
    expect(
      result.fields.find((f) => f.field === 'entreelibre').optional,
    ).toBeFalsy();
  });

  it('should reject field with reserved slug', async () => {
    await expect(
      core.agendas(60935574).settings.schema.updateFields([
        {
          field: 'uid',
          label: 'Custom UID Field',
          fieldType: 'text',
        },
      ]),
    ).rejects.toThrow('Field slug "uid" is reserved and cannot be used');
  });

  it('should reject field with another reserved slug', async () => {
    await expect(
      core.agendas(60935574).settings.schema.updateFields([
        {
          field: 'slug',
          label: 'Custom Slug Field',
          fieldType: 'text',
        },
      ]),
    ).rejects.toThrow('Field slug "slug" is reserved and cannot be used');
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

    it('get settings eventSchema for configuration', async () => {
      const res = await ky
        .get(
          'http://localhost:4000/agendas/60935574/settings/eventSchema/configure',
          { searchParams: { key: administratorKey, lang: 'en' } },
        )
        .json();
      expect(res.parents.length).toBe(2);
      expect(res.schema).toBeTruthy();
    });

    it('get settings eventSchema without split options', async () => {
      const res = await ky
        .get(
          `http://localhost:4000/agendas/60935574/settings/eventSchema?key=${administratorKey}`,
        )
        .json();
      expect(res.fields).toBeTruthy();
    });

    it('succesfull post eventSchema from adminUser', async () => {
      let result;
      try {
        result = await ky
          .post(
            'http://localhost:4000/agendas/60935574/settings/eventSchema/configure',
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

    it('unsuccessfull post eventSchema from contrib', async () => {
      const response = await ky
        .post(
          'http://localhost:4000/agendas/60935574/settings/eventSchema/configure',
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
