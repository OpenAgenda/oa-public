'use strict';

const _ = require('lodash');
const axios = require('axios');
const api = require('../api');
const Services = require('../services/init');
const Core = require('../core');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('core - functional (server): core.agendas().settings.get()', () => {
  let core;
  const config = testConfig.extendWith({ cachePrefix: 'c06_01_core_agendas_settings_test' });

  beforeAll(() => loadFixtures(config.db, '007.sql'));

  beforeAll(async () => {
    const services = await Services(config, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'queues',
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
        'tracker',
      ],
    });

    core = Core(services, testConfig);
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  it('get field configuration of an agenda not linked to a network', async () => {
    const result = await core.agendas(60934473).settings.get({ access: 'internal' });

    expect(result.fields.map(f => f.field)).toEqual([
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

    expect(result.fields.map(f => f.field)).toEqual([
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
    expect(result.schema.fields.map(f => f.field)).toEqual([
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
    await core.agendas(60935574).settings.schema.updateFields([{ field: 'phone', optional: false }], { access: 'administrator' });
    const result = await core.agendas(60935574).settings.schema.getMember();
    expect(result.fields.find(f => f.field === 'phone').optional).toBeFalsy();
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

    it('get settings eventSchema for configuration', async () => {
      const res = await axios.get(`http://localhost:3000/agendas/60935574/settings/eventSchema/configure?key=${administratorKey}`, { params: { lang: 'en' } });
      expect(res.data.parents.length).toBe(2);
      expect(res.data.schema).toBeTruthy();
    });

    it('get settings eventSchema without split options', async () => {
      const res = await axios.get(`http://localhost:3000/agendas/60935574/settings/eventSchema?key=${administratorKey}`, { params: {} });
      expect(res.data.fields).toBeTruthy();
    });

    it('succesfull post eventSchema from adminUser', async () => {
      let result;
      try {
        result = await axios({
          method: 'post',
          url: 'http://localhost:3000/agendas/60935574/settings/eventSchema/configure',
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

    it('unsuccessfull post eventSchema from contrib', async () => {
      let response;
      try {
        await axios({
          method: 'post',
          url: 'http://localhost:3000/agendas/60935574/settings/eventSchema/configure',
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
