"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const mysql = require( 'mysql' );
const { promisify } = require( 'util' );
const should = require( 'should' );

const fixtures = require( './fixtures/06_core_agenda_settings' );

const config = require( '../config' );
const core = require( '../core' );

const schemaNames = require( './mock/schemaNames' );
const getLogConfig = require( './mock/getLogConfig' );
const assignClients = require( './utils/assignClients' );

const testConfig = {
  queues: {},
  db: {
    user: 'root',
    password: 'grut',
    database: 'oatest'
  },
  redis: {
    host: 'localhost',
    port: 6379
  },
  schemas: schemaNames,
  imageSizeLimits: [ 1000, 10000000 ],
  tmpFolderPath: '/var/tmp/',
  aws: {
    bucket: 'openagendatst',
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    defaultImagePath: config.aws.defaultImagePath,
    imageBucketPath: 'https://openagendatest.s3.amazonaws.com/'
  },
  esLocation: {
    //log: [  ],
    index: 'locations',
    apiVersion: '1.3',
    timeout: 30000
  },
  es: {
    host: process.env.ELASTICSEARCH_134_DEV_HOST,
    port: process.env.ELASTICSEARCH_134_DEV_PORT
  },
  es53: {
    host: process.env.ELASTICSEARCH_533_DEV_HOST,
    port: process.env.ELASTICSEARCH_533_DEV_PORT
  },
  getLogConfig
};


describe( 'core - functional ( server ): settings get', function() {

  this.timeout( 20000 );

  before( async () => {

    const con = mysql.createConnection( _.extend( _.pick( config.db, [ 'user', 'password' ] ), {
      multipleStatements: true
    } ) );

    const query = promisify( con.query.bind( con ) );

    const result = await query( fixtures );

    con.end();

  } );

  before( () => assignClients( testConfig ) );

  before( async () => {

    await core.init( testConfig, {
      enabled: [
        'queues',
        'events',
        'agendas',
        'agendaEvents',
        'agendaStakeholders',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys'
      ]
    } );

  } );

  after( () => testConfig.knex.destroy() );

  it( 'get field configuration of an agenda not linked to a network', async () => {

    const result = await core.agendas( 60934473 ).settings.get();

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

    const result = await core.agendas( 60935574 ).settings.get();

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
