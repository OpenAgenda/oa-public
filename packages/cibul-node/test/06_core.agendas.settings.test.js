'use strict';

const _ = require('lodash');
const Services = require('../services/init');
const Core = require('../core');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('core - functional (server): core.agendas().settings.get()', function() {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '007.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'queues',
        'files',
        'events',
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
        'tracker'
      ]
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
      'category-group'
    ]);
  });

  it('get field configuration of an agenda linked to a network', async () => {
    const result = await core.agendas(60935574).settings.get({
      access: 'internal'
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
      'edition'
    ]);
  });

});
