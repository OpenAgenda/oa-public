'use strict';

const _ = require('lodash');
const knex = require('knex');
const mysql = require( 'mysql' );
const { promisify } = require( 'util' );
const should = require( 'should' );

const fixtures = require('./fixtures/01_core_agendas_events_get');

const config = require('../config');
const core = require('../core');

const schemaNames = require('./mock/schemaNames');
const getLogConfig = require('./mock/getLogConfig');
const assignClients = require('./utils/assignClients');

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

describe('core - fuctional (server): core agenda events get', function() {
  this.timeout(20000);

  before( async () => {
    const con = mysql.createConnection(Object.assign( _.pick(config.db, ['user', 'password']), {
      multipleStatements: true
    }));

    const query = promisify(con.query.bind(con));

    const result = await query(fixtures);

    con.end();
  });

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

  describe('simple get', () => {
    let event;

    before(async () => {
      event = await core.agendas(2).events.get(1);
    });


    it('requested event is returned directly by get', () => {
      event.uid.should.equal(1);
    });

    it('extended field is provided', () => {
      event.thematique.should.equal(2);
    });

    it('extended restricted access field is not provided', () => {
      should(event.note).equal(undefined);
    });

    it('location is not provided, just location uid', () => {
      should(event.location).equal(undefined);
      event.locationUid.should.equal(1);
    });

    it('origin agenda is provided', () => {
      should(event.agenda).eql({
        uid: 1,
        title: 'Une commune de Fraaance',
        slug: 'une-commune-de-fraaance',
        description: null,
        image: null,
        url: null
      });
      event
    });
  });

  describe('get with option detailed: true', () => {
    let event;

    before(async () => {
      event = await core.agendas(2).events.get(1, { detailed: true });
    });

    it('location is provided', () => {
      Object.keys(event.location).should.eql([
        'uid', 'slug', 'name', 'address',
        'city', 'region', 'department', 'postalCode',
        'insee', 'countryCode', 'district',
        'latitude', 'longitude', 'updatedAt'
      ]);
    });

  });

  describe('get with access option', () => {

    it('if null is set on access, all extended fields are provided', async () => {
      const event = await core.agendas(2).events.get(1, { access: null });

      event.thematique.should.equal(2);
      event.note.should.equal('Une note interne pour les administrateurs');
    });

    it('if provided access value does not match set value in field, value is not provided', async () => {
      const event = await core.agendas(2).events.get(1, { access: 'moderator' });

      should(event.note).equal(undefined);
    });

    it('if provided access value matches field configuration, value is provided', async () => {
      const event = await core.agendas(2).events.get(1, { access: 'administrator' });

      event.thematique.should.equal(2);
      event.note.should.equal('Une note interne pour les administrateurs');
    });

  });

  describe('get with option returnPayload: true', () => {
    let result;

    before(async () => {
      result = await core.agendas(2).events.get(1, { returnPayload: true });
    });

    it('success key is true when get is successful', () => {
      result.success.should.equal(true);
    });

    it('current agenda is available under agenda key', () => {
      result.agenda.uid.should.equal(2);
    });

    it('origin agenda is available under originAgenda key', () => {
      result.originAgenda.uid.should.equal(1);
    });

    it('schema is available under formSchema key, with public fields', () => {
      console.log(result.formSchema.fields.map(f => f.field)); // id should not be there
    });

  });

});
