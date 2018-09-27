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
    eventEditor: 'legacy_event_editor',
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
  getLogConfig: () => null
};





describe( 'core - functional ( server ): agenda event update', function() {

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
        'agendaStakeholders',
        'formSchemas',
        'custom'
      ]
    } );

  } );

  after( () => {

    return testConfig.knex.destroy();

  } );

  describe( 'successful update', () => {

    let event, agenda;

    before( done => {

      agendas.get( { uid: 17026855 }, { internal: true }, ( err, a ) => {

        agenda = a;
        
        done();

      } );

    } );

    before( async () => {

      const result = await core.agendas( 17026855 ).events.create( {
        slug: 'un-event',
        title: {
          fr: 'Un événement'
        },
        timings: [ {
          begin: new Date,
          end: new Date
        } ],
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [ 3, 4 ]
      } );

      event = result.created.event;

    } );

    before( async () => {

      await core.agendas( 17026855 ).events.update( event.uid, {
        state: 0,
        featured: true,
        slug: 'un-event-maj',
        title: {
          fr: 'Un événement mis à jour',
          en: 'An updated event'
        },
        timings: [ {
          begin: new Date,
          end: new Date
        }, {
          begin: new Date,
          end: new Date
        } ],
        'custom_description' : 'Meh',
        'categories-agenda-metropolitain': 43,
        'thematiques-bordeaux-metropole' : [ 3, 4 ]
      } );

    } );

    it( 'the core event was updated', async () => {

      ( await events.get( { uid: event.uid } ) )
        .should.match( {
          slug: 'un-event-maj',
          title: {
            fr: 'Un événement mis à jour',
            en: 'An updated event'
          }
        } );

    } );

    it( 'the state of the agenda event was updated', async () => {

      ( await agendaEvents( 17026855 ).get( event.uid ) )
        .should.match( {
          featured: true,
          state: 0
        } );

    } );

    it( 'the custom data is updated as well', async () => {

      const updatedCustom = await custom( agenda.formSchemaId ).get( event.uid );

      updatedCustom.should.eql( {
        custom_description: 'Meh',
        intermunicipal_interest: [],
        recurring: [],
        'thematiques-bordeaux-metropole': [ 3, 4 ],
        'bordeaux-metropole': [],
        'categories-agenda-metropolitain': 43
      } );

    } );


    it( 'if only agendaEvent & custom data are provided, event does not require update' );

  } );

  describe( 'draft', () => {

    const agendaUid = 17026855;

    let draftEventUid;

    const errors = [];

    let result;

    before( async () => {

      const result = await core.agendas( agendaUid ).events.create( {
        title: {
          fr: 'Un événement'
        },
      }, { draft: true } );

      draftEventUid = result.created.event.uid;

    } );

    it( 'an update of a draft is possible with a draft option set', async () => {

      const result = await core.agendas( agendaUid ).events.update( draftEventUid, {
        title: {
          fr: 'Un événement mis à jour'
        },
      }, { draft: true } );

      result.updated.event.draft.should.ok();

      result.updated.event.title.should.eql( {
        fr: 'Un événement mis à jour'
      } );

    } );

    it( 'an update of a draft without the draft option undrafts the event', async () => {

      const result = await core.agendas( agendaUid ).events.update( draftEventUid, {
        title: {
          fr: 'La mort.'
        },
        timings: [ {
          begin: new Date,
          end: new Date
        } ],
        keywords: {
          fr: [ 'un', 'deux', 'trois' ]
        },
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [ 3, 4 ]
      } );

      result.updated.event.draft.should.not.ok();

    } );

  } );

} );
