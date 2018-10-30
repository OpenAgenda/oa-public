"use strict";

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const mysql = require( 'mysql' );
const { promisify } = require( 'util' );

const fixtures = require( './fixtures/05_core_agenda_events_custom' );

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
    eventEditor: 'legacy_event_editor',
    agendaEvent: 'legacy_agenda_event',
    eventReferences: 'legacy_agenda_event_reference',
    agendaEventTag: 'legacy_agenda_event_tag',
    user: 'user',
    stakeholder: 'member',
    stakeholderSettings: 'member_settings'
  },
  tmpFolderPath: '/var/tmp/',
  aws: {
    bucket: 'openagendatst',
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


describe( 'core - functional ( server ): agenda event with custom data', function() {

  this.timeout( 20000 );

  const eventData = {
    title: {
      fr: 'Rugissant / Trésor de la guerre d\'Espagne et autres textes de Serge Pey'
    },
    description: { fr: "Culture" },
    longDescription: {
      fr:
        "#### Lecture musicale / Poésie / Serge Pey\n\n   \n\nLa Poésie c’est le pied ! c’est **une semaine consacrée à la poésie contemporaine** dans ce qu’elle a de plus divers, en invitant à la fois des poètes·ses et des comédien·nes qui donnent voix aux poètes·ses.\n\nCatherine Vaniscotte s’empare du **_Trésor de la guerre d’Espagne_** et de _**La Boîte aux lettres du cimetière**_.\n\n« Les personnages de ses nouvelles souvent inspirées d’histoires vraies racontent leur combat pour la liberté, la résistance contre l’oppression, l’exil et la fraternité. Ces écrits de **Serge Pey**, très intenses, étrangement drôles, parfois cruels ou tendres me touchent, me bousculent, me donnent envie de partager « à voix haute » ses pensées, ses interrogations, et cette volonté de vivre libre. Nous serons en duo avec **Frédéric Cavallin**, musicien, qui accompagnera les mots, leur donnera du relief et des paysages sonores. » Catherine Vaniscotte.\n\n   \n\nDurée : 45 min."
    },
    conditions: { fr: "6 €" },
    registration: [
      "https://cavepoesie.festik.net/lecture-rugissant-tresor-de-la-guerre-d-espagne-et-autres-textes"
    ],
    keywords: {
      fr: [
        "lecture musicale",
        "poésie",
        "Serge Pey",
        "Catherine Vaniscotte",
        "semaine de la poésie"
      ]
    },
    timings: [
      {
        begin: "2017-12-05T18:30:00.000Z",
        end: "2017-12-05T18:30:00.000Z"
      }
    ],
    accessibility: [],
    "thematiques-metropolitaines": [3],
    "types-devenements": [25],
    public: [27],
    organisateur: [32],
    "tag-group-4": [36],
    'cle_session' : 1928391,
    image: {
      url:
        "https://s3.eu-central-1.amazonaws.com/oastatic/integration_4.jpg",
      credits: "Visuel Cave Poésie"
    },
    locationUid: 65208887
  };

  before( () => {

    testConfig.knex = knexLib( { client: 'mysql', connection: testConfig.db } );

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
        'agendaLocations',
        'formSchemas',
        'custom',
        'networks'
      ]
    } );

  } );

  after( () => testConfig.knex.destroy() );

  describe( 'no network', function() {

    it( 'legacy entries were created for custom fields', async () => {

      const result = await core.agendas( 60934473 ).events.create( eventData );

      const createdEventUid = result.created.event.uid;

      const { id: eventId } = await testConfig.knex( 'event' ).first( 'id' ).where( {
        uid: createdEventUid
      } );

      const legacyAgendaEvent = await testConfig.knex( 'legacy_agenda_event' ).first().where( 'event_id', eventId );

      const legacyTags = await testConfig.knex( 'legacy_agenda_event_tag' ).where( 'review_article_id', legacyAgendaEvent.id );

      legacyTags.map( t => _.pick( t, [ 'review_article_id', 'review_tag_id' ] ) ).should.eql( [ {
        review_article_id: legacyAgendaEvent.id,
        review_tag_id: 27854,
      }, {
        review_article_id: legacyAgendaEvent.id,
        review_tag_id: 27878,
      }, {
        review_article_id: legacyAgendaEvent.id,
        review_tag_id: 27879,
      }, {
        review_article_id: legacyAgendaEvent.id,
        review_tag_id: 27884,
      }, {
        review_article_id: legacyAgendaEvent.id,
        review_tag_id: 27888,
      } ] );

    } );


    it( 'legacy entries were created for custom fields of "custom" legacy origin', async () => {

      const result = await core.agendas( 60934473 ).events.create( eventData );

      const createdEventUid = result.created.event.uid;

      const { id: eventId } = await testConfig.knex( 'event' ).first( 'id' ).where( {
        uid: createdEventUid
      } );

      const legacyEvent = await testConfig.knex( 'legacy_event' ).first().where( 'id', eventId );

      JSON.parse( legacyEvent.custom_fields ).cle_session.should.equal( 1928391 );

    } );


    it( 'legacy entries were added with update', async () => {

      const eventDataWithMissingCustom = _.omit( eventData, [ 'thematiques-metropolitaines', 'types-devenements', 'tag-group-4', 'organisateur', 'public' ] );

      const result = await core.agendas( 60934473 ).events.create( eventDataWithMissingCustom );

      const createdEventUid = result.created.event.uid;

      const { id: eventId } = await testConfig.knex( 'event' ).first( 'id' ).where( {
        uid: createdEventUid
      } );

      const legacyAgendaEvent = await testConfig.knex( 'legacy_agenda_event' ).first().where( 'event_id', eventId );

      ( await testConfig.knex( 'legacy_agenda_event_tag' ).where( 'review_article_id', legacyAgendaEvent.id ) ).length.should.equal( 0 );

      await core.agendas( 60934473 ).events.update( createdEventUid, _.extend( {
        "tag-group-4": [36]
      }, eventDataWithMissingCustom ) );

      ( await testConfig.knex( 'legacy_agenda_event_tag' ).where( 'review_article_id', legacyAgendaEvent.id ) ).length.should.equal( 1 );

    } );

  } );


  describe( 'create with network', function() {

    const networkEventData = ih( eventData, {
      edition: { $set: 'Dernier trimestre 2018' }
    } );

    const result = {};

    before( async () => {

      _.assign( result, await core.agendas( 60935574 ).events.create( networkEventData ) );

    } );

    it( 'creation returns network custom data in networkCustom key', async () => {

      result.created.networkCustom.should.eql( { edition: 'Dernier trimestre 2018' } );

    } );

    it( 'network custom entry is saved separately from agenda custom entry', async () => {

      const agendaCustomData = await custom( 26 ).get( result.created.event.uid );

      const networkCustomData = await custom( 27 ).get( result.created.event.uid );

      agendaCustomData.should.eql( { 
        entreelibre: [],
        'thematiques-metropolitaines': [ 3 ],
        'types-devenements': [ 25 ],
        public: [ 27 ],
        organisateur: [ 32 ],
        'tag-group-4': 36,
        cle_session: 1928391,
        'category-group': null 
      } );

      networkCustomData.should.eql( {
        edition: 'Dernier trimestre 2018'
      } );

    } );

  } );


  describe( 'update with network', function() {

    const networkEventData = ih( eventData, {
      edition: { $set: 'Dernier trimestre 2018' }
    } );

    const networkUpdatedData = ih( eventData, {
      edition: { $set: 'Premier trimestre 2019' }
    } );

    const result = {};

    before( async () => {

      const { created } = await core.agendas( 60935574 ).events.create( networkEventData );

      _.assign( result, await core.agendas( 60935574 ).events.update( created.event.uid, networkUpdatedData ) );

    } );

    it( 'update returns network custom data in networkCustom key', async () => {

      result.updated.networkCustom.should.eql( { edition: 'Premier trimestre 2019' } );

    } );

  } ); 


} );
