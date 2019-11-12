"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const knexLib = require( 'knex' );
const mysql = require( 'mysql' );
const redis = require( 'redis' );
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
  tmpFolderPath: '/var/tmp/',
  imageSizeLimits: [ 2000, 10000000 ],
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


describe( '05 - core - functional ( server ): agenda event with custom data', function() {

  this.timeout( 60000 );

  const eventData = {
    title: {
      fr: 'Rugissant / Trésor de la guerre d\'Espagne et autres textes de Serge Pey'
    },
    description: { fr: "Culture" },
    location: {
      uid: 123
    },
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
        end: "2017-12-05T18:32:00.000Z"
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
        'images',
        'files',
        'imageFiles',
        'agendaEvents',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'networks',
        'elasticsearch',
        'legacy'
      ]
    } );

  } );

  after( () => testConfig.knex.destroy() );

  describe( 'no network', function() {

    const agendaUid = 60934473;
    let createdEventUid;

    before( async () => {

      const result = await core.agendas( agendaUid ).events.create( eventData );

      createdEventUid = result.created.uid;

    } );

    it( 'legacy entries were created for custom fields', async () => {

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

      const { id: eventId } = await testConfig.knex( 'event' ).first( 'id' ).where( {
        uid: createdEventUid
      } );

      const legacyEvent = await testConfig.knex( 'legacy_event' ).first().where( 'id', eventId );

      JSON.parse( legacyEvent.custom_fields ).cle_session.should.equal( 1928391 );

    } );

    it('legacy entries were added with update', async () => {

      const eventDataWithMissingCustom = _.omit(eventData, ['thematiques-metropolitaines', 'types-devenements', 'tag-group-4', 'organisateur', 'public']);

      const result = await core.agendas(agendaUid).events.create(eventDataWithMissingCustom);

      const createdEventUid = result.created.uid;

      const { id: eventId } = await testConfig.knex('event').first('id').where({
        uid: createdEventUid
      });

      const legacyAgendaEvent = await testConfig.knex( 'legacy_agenda_event' ).first().where( 'event_id', eventId );

      ( await testConfig.knex( 'legacy_agenda_event_tag' ).where( 'review_article_id', legacyAgendaEvent.id ) ).length.should.equal( 0 );

      const result2 = await core.agendas(agendaUid).events.update(createdEventUid, Object.assign({
        "tag-group-4": [36]
      }, eventDataWithMissingCustom));

      (await testConfig.knex( 'legacy_agenda_event_tag' ).where( 'review_article_id', legacyAgendaEvent.id ) ).length.should.equal( 1 );

    } );

    it( 'get gets the event with agenda custom data', async () => {

      const event = await core.agendas( agendaUid ).events.get(createdEventUid);

      event.uid.should.equal( createdEventUid );

      [ 'public', 'entreelibre', 'thematiques-metropolitaines' ].forEach( field => {

        event[ field ].should.ok();

      } );

    } );

    it( 'agenda information is included in get', async () => {

      const event = await core.agendas( agendaUid ).events.get( createdEventUid );

      event.agenda.should.eql( {
        uid: agendaUid,
        slug: 'custom_fielded_agenda',
        title: 'Custom fielded agenda',
        description: null,
        image: null,
        url: null
      } );

    } );

    it( 'get with customOnly option only gets custom data', async () => {

      const data = await core.agendas( agendaUid ).events.get( createdEventUid, { customOnly: true } );

      should( data.uid ).equal( undefined );

      data.cle_session.should.equal( 1928391 );

    } );

    it( 'get with includeSchema gets data with event on one side and schema on the other', async () => {

      const { event, schema } = await core.agendas( agendaUid ).events.get( createdEventUid, {
        includeSchema: true
      } );

      event.uid.should.equal( createdEventUid );

      schema.fields.map( f => f.field ).should.eql( [
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

    it( 'get with specified access limits fetched custom fields to matching access', async () => {

      const contributorAccessEvent = await core.agendas( agendaUid ).events.get( createdEventUid, {
        access: 'contributor'
      } );

      _.keys( contributorAccessEvent ).includes( 'organisateur' ).should.equal( false );

      const administratorAccessEvent = await core.agendas( agendaUid ).events.get( createdEventUid, {
        access: 'administrator'
      } );

      _.keys( administratorAccessEvent ).includes( 'organisateur' ).should.equal( true );

    } );

    it( 'get with specified access limits returned schema fields', async () => {

      const { schema: contributorAccessSchema } = await core.agendas( agendaUid ).events.get( createdEventUid, {
        access: 'contributor',
        includeSchema: true
      } );

      const { schema: administratorAccessSchema } = await core.agendas( agendaUid ).events.get( createdEventUid, {
        access: 'administrator',
        includeSchema: true
      } );

      contributorAccessSchema.fields.map( f => f.field ).includes( 'organisateur' ).should.equal( false );

      administratorAccessSchema.fields.map( f => f.field ).includes( 'organisateur' ).should.equal( true );

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

    it('creation returns network custom data in networkCustom key', async () => {
      result.created.edition.should.eql('Dernier trimestre 2018');
    });

    it( 'network custom entry is saved separately from agenda custom entry', async () => {

      const agendaCustomData = await custom( 26 ).get( result.created.uid );

      const networkCustomData = await custom( 27 ).get( result.created.uid );

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


  describe('update with network', function() {

    const networkEventData = ih(eventData, {
      edition: { $set: 'Dernier trimestre 2018' }
    });

    const networkUpdatedData = ih(eventData, {
      edition: { $set: 'Premier trimestre 2019' }
    });

    const result = {};

    before(async () => {
      const { created } = await core.agendas(60935574).events.create(networkEventData);

      Object.assign(result, await core.agendas(60935574).events.update(created.uid, networkUpdatedData));
    });

    it('update includes network custom data in response', async () => {
      result.updated.edition.should.equal('Premier trimestre 2019');
    });

  });

});
