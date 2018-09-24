"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const fs = require( 'fs' );
const ih = require( 'immutability-helper' );
const mysql = require( 'mysql' );
const { promisify } = require( 'util' );
const should = require( 'should' );
const VError = require( 'verror' );

const fixtures = fs.readFileSync( __dirname + '/fixtures/01_02_core_agenda_events_create_add.sql', 'utf-8' );

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
    eventEditor: 'legacy_event_editor',
    agendaEvent: 'legacy_agenda_event',
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
  mainChannel: 'maintest',
  getLogConfig: ( prefix, key ) => ( {
    debug: {
      prefix: prefix + ':' + key + ':'
    },
    token: null
  } ),
  logger: {
    debug: {
      prefix: 'oa:',
      enable: false
    }
  },
  es53: {
    host: 'http://ns397902.ip-151-80-41.eu',
    port: 9205
  }
};


describe( 'core - functional ( server ): agenda event create', function() {

  this.timeout( 20000 );

  before( () => {

    testConfig.knex = knexLib( {
      client: 'mysql',
      connection: testConfig.db,
    } );

  } );

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
        'custom',
        'eventSearch'
      ]
    } );

  } );

  after( () => {

    return testConfig.knex.destroy();

  } );

  describe( 'successful creates', () => {

    let event;

    let eventServiceConfig;

    const onCreateCalls = [];

    before( () => {

      eventServiceConfig = events.getConfig();

      events.init( ih( eventServiceConfig, {
        interfaces: {
          onCreate: {
            $set: ( event, context ) => {

              onCreateCalls.push( [ event, context ] );

            }
          }
        }
      } ) );

    } );


    before( async () => {

      const result = await core.agendas( 17026855 ).events.create( {
        slug: 'un-evenement',
        title: {
          fr: 'Un événement'
        },
        timings: [ {
          begin: new Date,
          end: new Date
        } ],
        keywords: {
          fr: [ 'un', 'deux', 'trois' ]
        },
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [ 3, 4 ],
        accessibility: { sl: true }
      } );

      event = result.created.event;

    } );



    after( () => {

      events.init( ih( events.getConfig(), {
        interfaces: {
          onCreate: {
            $set: ( event, context ) => {}
          }
        }
      } ) );

    } );


    it( 'adds event to event service', async () => {

      const fetched = await events.get( {
        uid: event.uid
      } );

      fetched.should.ok;

    } );

    it( 'adds event to legacy event structure', done => {

      events.legacy.get( { uid: event.uid }, ( err, legacyEvent ) => {

        legacyEvent.slug.should.equal( event.slug );

        legacyEvent.uid.should.equal( event.uid );

        legacyEvent.title.should.eql( event.title );

        done();

      } );

    } );

    it( 'accessibility is saved in service and legacy', done => {

      events.get( {
        uid: event.uid
      } ).then( fetched => new Promise( rs => {

        fetched.accessibility.should.eql( {
          sl: true,
          vi: false,
          pi: false,
          hi: false,
          mi: false
        } );

        events.legacy.get( { uid: event.uid }, ( err, event ) => rs( event ) );

      } ) )

      .then( legacyEvent => {

        legacyEvent.accessibility.should.eql( {
          sl: true,
          vi: false,
          pi: false,
          hi: false,
          mi: false
        } );

        done();

      } );

    } );


    describe( 'draft', () => {

      // this agenda has no required custom fields
      const agendaUid = 55268170;

      const errors = [];

      let result;

      before( async () => {

        try {

          result = await core.agendas( agendaUid ).events.create( {
            title: {
              fr: 'Un événement'
            },
          }, { draft: true } );

        } catch ( e ) {

          [].concat( e ).map( e => errors.push( e ) )

        }

      } );

      it( 'no errors are registered for draft creationg', () => {

        errors.should.eql( [] );

      } );

      it( 'event is recorded in event service as draft', () => {

        result.created.event.draft.should.equal( 1 );

      } );

      it( 'draft event is not referenced in agenda', async () => {

        const eventUid = _.get( result, 'created.event.uid' );

        const ref = await agendaEvents( agendaUid ).get( eventUid );

        should( ref ).equal( null );

      } );

    } );


    describe( 'legacy custom data', () => {

      let legacyAgendaEvent, agenda, legacyEvent;

      before( done => {

        // should do a promise
        events.legacy.get( { uid: event.uid }, ( err, le ) => {

          legacyEvent = le;

          // should do here too
          agendas.get( { uid: 17026855 }, { internal: true }, ( err, a ) => {

            agenda = a;

            testConfig.knex( 'legacy_agenda_event' ).first().where( {
              event_id: legacyEvent.id,
              review_id: agenda.id
            } ).then( l => {

              legacyAgendaEvent = l;

              done();

            } );

          } );

        } );

      } );

      it( 'adds legacy category reference', () => {

        legacyAgendaEvent.category_id.should.not.equal( null );

      } );

      it( 'adds legacy record for agenda-event ( review_article )', () => {

        _.pick( legacyAgendaEvent, [ 'review_id', 'event_id', 'state' ] ).should.eql( {
          review_id: agenda.id,
          event_id: legacyEvent.id,
          state: 2
        } );

      } );

      it( 'adds legacy record for tags', async () => {

        const record = await testConfig.knex( 'legacy_agenda_event_tag' ).first().where( {
          review_article_id: legacyAgendaEvent.id
        } );

        record.should.be.ok;

      } );

    } );

    it( 'calls onCreate interface once', () => {

      onCreateCalls.length.should.equal( 1 );

    } );

    it( 'onCreate interface gets context', () => {

      onCreateCalls[ 0 ][ 1 ].transferToLegacy.should.equal( true );

    } );

  } );


  describe( 'successful create wizout slug', () => {

    let event;

    let result;

    let eventServiceConfig;

    const onCreateCalls = [];

    before( async () => {

      result = await core.agendas( 17026855 ).events.create( {
        title: {
          fr: 'Un événement'
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

    } );


    it( 'successful', () => {

      const slug = 'un-evenement';

      result.created.event.slug.substr( 0, slug.length ).should.equal( slug );

    } );


  } );

} );
