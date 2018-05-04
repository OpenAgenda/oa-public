"use strict";

process.env.NODE_ENV = 'test';


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


require( '@openagenda/logs' ).setModuleConfig( {
  debug: {
    enable: true
  }
} );


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
  tmpFolderPath: '/var/tmp/',
  aws: {
    bucket: 'openagendatst',
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
    defaultImagePath: config.aws.defaultImagePath,
    imageBucketPath: 'https://openagendatest.s3.amazonaws.com/'
  }
};


describe( 'core - functional ( server ): agenda event create with custom data', function() {

  this.timeout( 20000 );

  const eventData = {
    slug: "rugissant-tresor-de-la-guerre-despagne-et-autres-textes-de-serge-pey",
    title: {
      fr:
        "Rugissant / Trésor de la guerre d'Espagne et autres textes de Serge Pey"
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
    image: {
      url:
        "http://admin-toulouse.cutm.nfrance.com/documents/10718111/10791958/67104/6eaff609-8b62-4609-9504-1e83123fb234",
      credits: "Visuel Cave Poésie"
    },
    locationUid: 65208887
  };

  before( () => {

    testConfig.knex = knexLib( {
      client: 'mysql',
      connection: testConfig.db,
    } );

  } );

  beforeEach( async () => {

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

  after( () => testConfig.knex.destroy() );

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