"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
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
const custom = require( '@openagenda/custom' );

const config = require( '../config' );
const core = require( '../core' );

const _sleep = promisify( setTimeout.bind( null, rs => rs() ) );

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
  tmpFolderPath: '/var/tmp',
  aws: {
    bucket: 'openagendatest',
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    defaultImagePath: config.aws.defaultImagePath,
    imageBucketPath: 'https://openagendatest.s3.amazonaws.com/'
  },
  mainChannel: 'maintest',
  getLogConfig,
  logger: {
    debug: {
      prefix: 'oa:',
      enable: false
    }
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
  }
};


describe( 'core - functional ( server ): agenda event create', function() {

  this.timeout( 20000 );

  const eventData = {
    slug: 'un-evenement',
    title: {
      fr: 'Un événement'
    },
    description: {
      fr: 'Un tout petit événement'
    },
    timings: [ {
      begin: new Date( '2019-05-06T10:00:00' ),
      end: new Date( '2019-05-06T11:00:00' )
    } ],
    keywords: {
      fr: [ 'un', 'deux', 'trois' ]
    },
    location: {
      uid: 123
    },
    'categories-agenda-metropolitain': 42,
    'thematiques-bordeaux-metropole' : [ 3, 4 ],
    accessibility: { sl: true }
  };

  before( () => assignClients( testConfig ) );

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
        'legacy',
        'users',
        'keys'
      ]
    } );

  } );

  after( () => {

    return testConfig.knex.destroy();

  } );

  describe( 'anonymous create', () => {

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

      const result = await core.agendas( 17026855 ).events.create( eventData );

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
      const agendaUid = 17026855;

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

      it( 'no errors are registered for draft creation', () => {

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

      it( 'draft custom data is stored', async () => {

        const eventUid = _.get( result, 'created.event.uid' );

        const data = await custom( 2 ).get( eventUid );

        data.should.eql( {
          custom_description: null,
          intermunicipal_interest: [],
          recurring: [],
          'thematiques-bordeaux-metropole': [],
          'bordeaux-metropole': [],
          'categories-agenda-metropolitain': null
        } );

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


  describe( 'create by identified user', () => {

    let event;

    before( () => {
      events.init( events.getConfig() );
    } );


    before( async () => {

      const result = await core.agendas( 17026855 ).events.create( eventData, {
        context: {
          userUid: 63170200
        }
      } );

      event = result.created.event;

    } );

    it( 'user that was not a member becomes a member on open contribution agenda with no details on member required', async () => {

      // completing member data with userUid and agendaUid is done after
      // on an onCreate of the agendaStakeholder service.
      await _sleep( 300 );

      const row = await testConfig.knex( 'member' ).first( '*' ).where( 'user_uid', 63170200 );

      row.user_uid.should.equal( 63170200 );

    } );

  } );


  describe( 'other', () => {

    let event;

    let result;

    let eventServiceConfig;

    const onCreateCalls = [];

    before( async () => {

      result = await core.agendas( 17026855 ).events.create( {
        title: {
          fr: 'Un événement'
        },
        description: {
          fr: 'Quelques détails'
        },
        timings: [ {
          begin: {
            date: '2019-02-15',
            hours: 12,
            minutes: 39
          },
          end: {
            date: '2019-02-15',
            hours: 12,
            minutes: 50
          }
        } ],
        keywords: {
          fr: [ 'un', 'deux', 'trois' ]
        },
        'categories-agenda-metropolitain': 42,
        'thematiques-bordeaux-metropole' : [ 3, 4 ],
        location: {
          uid: 123
        }
      }, { formSchemaDataFormat: true } );

    } );


    it( 'slug was derived from title', () => {

      const slug = 'un-evenement';

      result.created.event.slug.substr( 0, slug.length ).should.equal( slug );

    } );


    it( 'event was created from a form-schema data format', () => {

      result.created.event.locationUid = 123;

    } );


  } );

} );
