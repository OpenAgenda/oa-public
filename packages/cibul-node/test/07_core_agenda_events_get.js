'use strict';

const _ = require('lodash');
const knex = require('knex');
const mysql = require( 'mysql' );
const { promisify } = require( 'util' );
const should = require( 'should' );

const fixtures = require('./fixtures/07_08_core_agenda_events_get_list');

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

describe('core - fuctional (server): event get', function() {
  this.timeout(20000);

  before( async () => {

    const con = mysql.createConnection(Object.assign( _.pick(config.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures);

    con.end();
  } );

  before(() => assignClients(testConfig));

  before(async () => {
    await core.init(testConfig, {
      enabled: [
        'queues',
        'events',
        'agendas',
        'agendaEvents',
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
    });
  });

  after(() => testConfig.knex.destroy());

  describe('basic get', () => {
    let event;

    before(async () => {
      event = await core.agendas(1).events.get(1);
    });

    it('event is provided by get', async () => {
      event.uid.should.equal(1);
    });

    it('origin agenda uid is provided by get', async () => {
      event.agendaUid.should.equal(1);
    });

    it('origin agenda is detailed in basic get', async () => {
      event.agenda.slug.should.equal('arles');
    });

    it('state is available', async () => {
      event.state.should.equal(2);
    });
  });

  describe('detailed get', () => {
    let event;

    before(async () => {
      event = await core.agendas(1).events.get(1, {
        detailed: true
      });
    });

    it('location details are provided', () => {
      event.location.name.should.equal('La boutique');
    });
  });

});
