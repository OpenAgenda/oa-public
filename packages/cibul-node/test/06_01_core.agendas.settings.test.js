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

  describe('api', () => {
    let server;
    const administratorKey = 'egP36aMb0toI8hAhFOm1if8auC1Vg1N9';

    beforeAll(async () => {
      server = await api(core).listen(3000);
    });

    afterAll(() => server.close());

    it('get settings eventSchema with split options', async () => {
      const res = await axios.get(`http://localhost:3000/agendas/60935574/settings/eventSchema?key=${administratorKey}`, { params: { split: '1', lang: 'en' } });
      expect(res.data.parents.length).toBe(2);
      expect(res.data.schema).toBeTruthy();
    });

    it('get settings eventSchema without split options', async () => {
      const res = await axios.get(`http://localhost:3000/agendas/60935574/settings/eventSchema?key=${administratorKey}`, { params: {} });
      expect(res.data.fields).toBeTruthy();
    });
  });
});
