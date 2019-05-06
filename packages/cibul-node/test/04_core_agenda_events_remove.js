"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const mysql = require( 'mysql' );
const { promisify } = require( 'util' );
const fixtures = require( 'fs' ).readFileSync( __dirname + '/fixtures/03_04_core_agenda_events_update_remove.sql', 'utf-8' );
const ih = require( 'immutability-helper' );
const should = require( 'should' );
const VError = require( 'verror' );

const custom = require( '@openagenda/custom' );
const events = require( '@openagenda/events' );
const agendas = require( '@openagenda/agendas' );
const agendaEvents = require( '@openagenda/agenda-events' );

const config = require( '../config' );
const core = require( '../core' );

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
  schemas: {
    agenda: 'agenda',
    eventService: 'event_2',
    agendaEventService: 'agenda_event',
    deleted: 'legacy_deleted',
    event: 'legacy_event',
    occurrence: 'legacy_occurrence',
    eventTranslation: 'legacy_event_translation',
    location: 'location',
    eventLocation: 'legacy_event_location',
    eventLocationTranslation: 'legacy_event_location_translation',
    agendaEvent: 'legacy_agenda_event',
    eventReferences: 'legacy_agenda_event_reference',
    eventEditor: 'legacy_event_editor',
    agendaCategory: 'legacy_agenda_category',
    agendaTag: 'legacy_agenda_tag',
    agendaEventTag: 'legacy_agenda_event_tag',
    user: 'user',
    stakeholder: 'member',
    stakeholderSettings: 'member_settings'
  },
  tmpFolderPath: '/var/tmp',
  aws: {
    bucket: 'openagendatest',
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    defaultImagePath: config.aws.defaultImagePath,
    imageBucketPath: 'https://openagendatest.s3.amazonaws.com/'
  },
  geocodeFarm: { key: 123 },
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
  getLogConfig: () => null
};





describe( 'core - functional ( server ): agenda event remove', function() {

  this.timeout( 20000 );

  before( () => {

    testConfig.knex = knexLib( {
      client: 'mysql',
      connection: testConfig.db,
    } );

  } )

  before( async () => {

    const con = mysql.createConnection( _.extend( _.pick( config.db, [ 'user', 'password' ] ), {
      multipleStatements: true
    } ) );

    const query = promisify( con.query.bind( con ) );

    const result = await query( fixtures );

    con.end();

  } );

  before( async () => {

    await core.init( testConfig, {
      enabled: [
        'events',
        'agendas',
        'agendaEvents',
        'agendaLocations',
        'agendaStakeholders',
        'formSchemas',
        'custom'
      ]
    } );

  } );

  after( () => {

    return testConfig.knex.destroy();

  } );

  describe( 'successful remove', () => {

    let event, result;

    before( async () => {

      const result = await core.agendas( 17026855 ).events.create( {
        slug: 'un-event',
        title: {
          fr: 'Un événement'
        },
        description: {
          fr: 'Une desc'
        },
        location: {
          uid: 123
        },
        timings: [ {
          begin: new Date( '2019-05-06T10:00:00' ),
          end: new Date( '2019-05-06T11:00:00' )
        } ],
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [ 3, 4 ]
      } );

      event = result.created.event;

    } );

    before( async () => {

      result = await core.agendas( 17026855 ).events.remove( event.uid );

    } );

    it( 'the core event is removed', async () => {

      result.success.should.equal( true );

      result.removed.event.should.be.ok;

      result.removed.custom.should.be.ok;

      result.removed.agendaEvent.should.be.ok;

    } );

  } );


  describe( 'successful draft remove', () => {

    let event, result;

    before( async () => {

      const result = await core.agendas( 17026855 ).events.create( {
        title: {
          fr: 'Un événement brouillon'
        },
        timings: [ {
          begin: new Date,
          end: new Date
        } ],
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [ 3, 4 ]
      }, { draft: true } );

      event = result.created.event;

    } );

    before( async () => {

      result = await core.agendas( 17026855 ).events.remove( event.uid );

    } );

    it( 'the draft event is removed', async () => {

      result.success.should.equal( true );

      result.removed.event.should.be.ok;

    } );

  } );

} );
