'use strict';

process.env.NODE_ENV = 'test';

const _ = require('lodash');
const knexLib = require('knex');
const mysql = require('mysql');
const { promisify } = require('util');
const should = require('should');

const fixtures = require('./fixtures/007.sql');

const Services = require('../services/init');
const Core = require('../core');

const schemaNames = require('./mock/schemaNames');
const getLogConfig = require('./mock/getLogConfig');
const assignClients = require('./utils/assignClients');

const testConfig = require('./testConfig');

describe('core - functional (server): core.agendas().settings.get()', function() {
  this.timeout(20000);
  let core;

  before(async () => {
    const con = mysql.createConnection(Object.assign( _.pick(testConfig.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));
    const result = await query(fixtures);

    con.end();
  });

  before(() => assignClients(testConfig));

  before(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'queues',
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

  after( () => testConfig.knex.destroy() );

  it( 'get field configuration of an agenda not linked to a network', async () => {

    const result = await core.agendas(60934473).settings.get();

    result.fields.map( f => f.field ).should.eql( [
      'entreelibre',
      'thematiques-metropolitaines',
      'types-devenements',
      'public',
      'organisateur',
      'tag-group-4',
      'cle_session',
      'category-group'
    ] );

  } );

  it( 'get field configuration of an agenda linked to a network', async () => {

    const result = await core.agendas(60935574).settings.get();

    result.fields.map( f => f.field ).should.eql( [
      'entreelibre',
      'thematiques-metropolitaines',
      'types-devenements',
      'public',
      'organisateur',
      'tag-group-4',
      'cle_session',
      'category-group',
      'edition'
    ] );

  } );

} );
