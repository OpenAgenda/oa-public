"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );

const svc = require( '../' );

const config = require( '../testconfig' );

describe( 'agendas - functional (server): set (create)', function() {

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

  before( () => svc.init( config ) );

  afterEach( () => svc.init( config ) );

  it( 'simplest create is with a title, a description and an owner', done => {

    svc.set( {
      ownerId: 12,
      title: 'Hello World',
      description: 'This is necessary'
    }, ( err, result ) => {

      should( err ).equal( null );

      result.should.eql( {
        agenda: { 
          slug: 'hello-world',
          image: null,
          uid: result.agenda.uid, // that 
          title: 'Hello World',
          description: 'This is necessary',
          url: null,
          settings: {
            mailing: {
              eventAggregation: false
            },
            contribution: {
              allowLocationCreate: true,
              defaultLang: null,
              defaultState: 2,
              message: null,
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
          official: 0,
          private: 0,
          indexed: 1,
          createdAt: result.agenda.createdAt,
          updatedAt: result.agenda.updatedAt
        },
        valid: true,
        success: true,
        errors: [] 
      } );

      done();

    } );

  } );


  it( 'title and description are mandatory', done => {

    svc.set( {
      ownerId: 3
    }, ( err, result ) => {

      should( err ).equal( null );

      result.valid.should.equal( false );

      result.errors.should.eql( [ { 
        field: 'title',
        code: 'required',
        message: 'a string is required',
        origin: undefined
      }, { 
        field: 'description',
        code: 'required',
        message: 'a string is required',
        origin: undefined
      }, { 
        field: 'slug',
        code: 'required',
        message: 'value must not be empty',
        origin: '' } 
      ] );

      done();

    } );

  } );


  it( 'set creates an agenda if no identifier is specified in first param', done => {

    svc.set( {
      ownerId: 1,
      title: 'Courbevoie',
      description: 'Que faire à Courbevoie',
      url: 'www.ville-courbevoie.fr/lagenda-de-vos-evenements.htm'
    }, ( err, result ) => {

      should( err ).equal( null );

      result.should.eql( { 
        agenda: {
          slug: 'courbevoie',
          uid: result.agenda.uid,
          title: 'Courbevoie',
          description: 'Que faire à Courbevoie',
          url: 'http://www.ville-courbevoie.fr/lagenda-de-vos-evenements.htm',
          settings: {
            mailing: {
              eventAggregation: false
            },
            contribution: {
              allowLocationCreate: true,
              defaultLang: null,
              defaultState: 2,
              message: null,
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
          image: null,
          official: 0,
          private: 0,
          indexed: 1,
          createdAt: result.agenda.createdAt,
          updatedAt: result.agenda.updatedAt
        },
        valid: true,
        success: true,
        errors: [] 
      } );

      done();

    } );

  } );


  it( 'set in create mode excludes internal values if internal option is not specified or false', done => {

    svc.set( {
      ownerId: 1,
      title: 'Blob 123',
      description: 'Evénements d\'une rando en Espagne/France/Italie'
    }, ( err, result ) => {

      should( result.agenda.id ).equal( undefined );

      done();

    } );

  } );


  it( 'set in create mode calls onCreate callback with created agenda including internal values', done => {


    svc.init( Object.assign( {}, config, {
      interfaces: {
        onCreate: ( agenda ) => {

          agenda.title.should.equal( 'Niargl' );

          should( agenda.id ).not.equal( undefined );

          done();

        }
      }
    } ) );

    svc.set( {
      ownerId: 1,
      title: 'Niargl',
      description: 'Blotock'
    }, () => {} )

  } );


  it( 'set in create mode returns internal values if internal option is true', done => {

    svc.set( {
      ownerId: 1,
      title: 'Seconde guerre punique',
      description: 'Evénements d\'une rando en Espagne/France/Italie'
    }, { internal: true }, ( err, result ) => {

      should( err ).equal( null );

      result.should.eql( {
        agenda: { 
          id: result.agenda.id,
          ownerId: 1,
          formSchemaId: null,
          slug: 'seconde-guerre-punique',
          uid: result.agenda.uid,
          title: 'Seconde guerre punique',
          description: 'Evénements d\'une rando en Espagne/France/Italie',
          url: null,
          image: null,
          official: 0,
          officializedAt: null,
          private: 0,
          indexed: 1,
          settings: {
            mailing: {
              eventAggregation: false
            },
            contribution: {
              allowLocationCreate: true,
              defaultLang: null,
              defaultState: 2,
              message: null,
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
            activatingInvitations: false,
            emailstrategie: false,
            moderators: false,
            tags: false,
            indesign: false,
            embedsHead: false,
            embedsTemplates: false,
            aggregator: false,
            prioritizedAggregator: false,
            invitationMessage: false,
            calendarView: false,
            docxExport: false
          },
          createdAt: result.agenda.createdAt,
          updatedAt: result.agenda.updatedAt
        },
        valid: true,
        success: true,
        errors: [] 
      } );

      done();

    } );

  } );

} );