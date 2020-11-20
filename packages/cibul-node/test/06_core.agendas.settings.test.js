'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const knexLib = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');

const Services = require('../services/init');
const Core = require('../core');

const schemaNames = require('./mock/schemaNames');
const getLogConfig = require('./mock/getLogConfig');
const assignClients = require('./utils/assignClients');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('core - functional (server): core.agendas().settings.get()', function() {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '007.sql'));
  beforeAll(() => assignClients(testConfig));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
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

  afterAll(() => {
    core.services.knex.destroy();
    testConfig.redisClient.quit();
  });

  it( 'get field configuration of an agenda not linked to a network', async () => {

    const result = await core.agendas(60934473).settings.get();

    expect(result.fields.map( f => f.field )).toEqual([
      'entreelibre',
      'thematiques-metropolitaines',
      'types-devenements',
      'public',
      'organisateur',
      'tag-group-4',
      'cle_session',
      'category-group'
    ]);

  } );

  it( 'get field configuration of an agenda linked to a network', async () => {

    const result = await core.agendas(60935574).settings.get();

    expect(result.fields.map( f => f.field )).toEqual([
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

  } );

} );
