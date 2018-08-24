"use strict";

process.env.NODE_ENV = 'test';

const async = require( 'async' );
const should = require( 'should' );

const config = require( '../testconfig' );
const svc = require( '../' );

describe( 'agendas - functional (server): get', function() {

  this.timeout( 30000 );

  before( require( './fixtures/load.js' ).bind( null, {
    mysql: config.mysql,
    files: [
      __dirname + '/fixtures/resetDb.sql',
      __dirname + '/../agenda.sql',
      __dirname + '/fixtures/agenda.data.sql',
      __dirname + '/fixtures/agendaEvent.data.sql',
      __dirname + '/fixtures/occurrence.data.sql'
    ],
    map: {
      database: config.mysql.database,
      agenda: 'agenda',
      agendaEvent: 'agenda_event',
      occurrence: 'occurrence'
    }
  } ) );

  before( () => {
    svc.init( config );
  } );
  
  it( 'get gets an agenda by id', done => {

    svc.get( 4875, ( err, agenda ) => {

      should( err ).equal( null );

      agenda.should.eql( {
        slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016',
        uid: 52084961,
        title: 'Programme des animations du Salon du Fromage et des Produits Laitiers 2016',
        description: 'Des animations pour des expériences autour du goût et des savoir-faire / Numerous events to have experiences around taste and know-how',
        url: 'http://www.salon-fromage.com/',
        image: 'review_programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016_00.jpg',
        settings: {
          inbox: {
            mailto: null
          },
          mailing: {
            eventAggregation: false
          },
          contribution: {
            allowLocationCreate: true,
            defaultLang: null,
            defaultState: 2,
            message: null,
            messages: {
              instructions: null,
              complete: null,
              publication: null
            },
            type: 2,
            useFields: false,
            authorizedIPAddresses: [],
            canPublish: [ 'administrators', 'moderators' ],
            moderateOnChangeBy: [],
            survey: false
          },
          translation: {
            enabled: false,
            sets: [],
            options: null,
            service: 'reverso',
            source: 'fr'
          }
        },
        createdAt: agenda.createdAt,
        updatedAt: agenda.updatedAt,
        official: 0,
        private: 0,
        indexed: 1
      } );

      done();

    } );

  } );


  it( 'find one agenda by title', done => {

    svc.findOne( 'Produits Laitiers', ( err, agenda ) => {

      should( err ).equal( null );

      agenda.uid.should.equal( 52084961 );

      done();

    } );

  } );


  it( 'get with includeImagePath option to true, gets the agenda with image path', done => {

    svc.get( 4875, { includeImagePath: true }, ( err, agenda ) => {

      agenda.image.should.equal( config.imagePath + 'review_programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016_00.jpg' )

      done();

    } );

  } );


  it( 'get gets an agenda with details', done => {

    svc.get( 4848, { detailed: true }, ( err, agenda ) => {

      should( err ).equal( null );

      agenda.publishedEvents.should.equal( 10 );
      agenda.upcomingPublishedEvents.should.equal( 8 );

      done();

    } );

  } );


  it( 'get gets an agenda with restricted details', done => {

    svc.get( 4848, { detailed: true, includeRestricted: true }, ( err, agenda ) => {

      agenda.totalEvents.should.equal( 19 );

      done();

    } );

  } );

  it( 'get gets an agenda by slug', done => {

    svc.get( { slug: 'epn-espace-torcy' }, ( err, agenda ) => {

      should( err ).equal( null );

      agenda.should.eql( { 
        slug: 'epn-espace-torcy',
        uid: 94345899,
        title: 'EPN "Espace Torcy"',
        description: 'Agenda de l\'EPN "Espace Torcy"\r\n2 rue de Torcy 75018 Paris\r\nTél : 01 40 38 67 00\r\nEmail : epn@ensparis.fr',
        url: 'http://www.ensparis.fr',
        settings: {
          inbox: {
            mailto: null
          },
          mailing: {
            eventAggregation: false
          },
          contribution: {
            allowLocationCreate: true,
            defaultLang: null,
            defaultState: 2,
            message: null,
            messages: {
              instructions: null,
              complete: null,
              publication: null
            },
            type: 2,
            useFields: false,
            authorizedIPAddresses: [],
            canPublish: [ 'administrators', 'moderators' ],
            moderateOnChangeBy: [],
            survey: false
          },
          translation: {
            enabled: false,
            sets: [],
            options: null,
            service: 'reverso',
            source: 'fr'
          }
        },
        image: 'review_epn-espace-torcy_00.jpg',
        createdAt: agenda.createdAt,
        updatedAt: agenda.updatedAt,
        official: 0,
        private: 0,
        indexed: 1
      } );

      done();

    } );

  } );


  it( 'get with unspecified "private" option cannot get private agenda', done => {

    svc.get( { slug: 'agenda-culture-gradignan' }, ( err, agenda ) => {

      should( err ).equal( null );
      should( agenda ).equal( null );

      done();

    } );

  } );

  it( 'get with nulled "private" option gets private agenda', done => {

    svc.get( { slug: 'agenda-culture-gradignan' }, { private: null }, ( err, agenda ) => {

      agenda.slug.should.equal( 'agenda-culture-gradignan' );

      done();

    } );

  } );

  it( 'get with truthy "private" option gets private agenda', done => {

    svc.get( { slug: 'agenda-culture-gradignan' }, { private: true }, ( err, agenda ) => {

      agenda.slug.should.equal( 'agenda-culture-gradignan' );

      done();

    } );

  } );
  

  it( 'get with internal option gets internal data like credentials and id', done => {

    svc.get( { uid: 94345899 }, { internal: true }, ( err, agenda ) => {

      should( err ).equal( null );

      agenda.should.eql( {
        id: 4830,
        ownerId: 7228,
        slug: 'epn-espace-torcy',
        uid: 94345899,
        title: 'EPN "Espace Torcy"',
        description: 'Agenda de l\'EPN "Espace Torcy"\r\n2 rue de Torcy 75018 Paris\r\nTél : 01 40 38 67 00\r\nEmail : epn@ensparis.fr',
        formSchemaId: null,
        url: 'http://www.ensparis.fr',
        image: 'review_epn-espace-torcy_00.jpg',
        settings: {
          inbox: {
            mailto: null
          },
          mailing: {
            eventAggregation: false
          },
          contribution: {
            allowLocationCreate: true,
            defaultLang: null,
            defaultState: 2,
            message: null,
            messages: {
              instructions: null,
              complete: null,
              publication: null
            },
            type: 2,
            useFields: false,
            authorizedIPAddresses: [],
            canPublish: [ 'administrators', 'moderators' ],
            moderateOnChangeBy: [],
            survey: false
          },
          translation: {
            enabled: false,
            sets: [],
            options: null,
            service: 'reverso',
            source: 'fr'
          }
        },
        credentials: {
          useContributeApp: false,
          activatingInvitations: false,
          emailstrategie: false,
          embedsHead: false,
          embedsTemplates: false,
          indesign: false,
          moderators: false,
          tags: false,
          aggregator: false,
          prioritizedAggregator: false,
          invitationMessage: false,
          calendarView: false,
          docxExport: false,
          eventOwnershipTransfer: false
        },
        createdAt: agenda.createdAt,
        updatedAt: agenda.updatedAt,
        official: 0,
        officializedAt: null, 
        private: 0,
        indexed: 1
      } );

      done();

    } );

  } );


  it( 'a few gets do not leak db connections', done => {

    let remaining = 400;

    async.whilst( () => remaining, wcb => {

      svc.get( { uid: 94345899 }, ( err, agenda ) => {

        remaining--;

        wcb( err );

      } );

    }, err => {

      remaining.should.equal( 0 );

      should( err ).equal( null );

      done();

    } )

  } );

} );
