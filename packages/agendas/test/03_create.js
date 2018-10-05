"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );

const config = require( '../testconfig' );
const svc = require( '../' );

describe( 'agendas - functional (server): set (create)', function() {

  this.timeout( 30000 );

  before( require( './fixtures/load.js' ).bind( null, {
    mysql: config.mysql,
    files: [
      __dirname + '/fixtures/resetDb.sql',
      __dirname + '/../model.sql',
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

      _.pick( result.agenda, [ 'slug', 'image', 'title' ] ).should.eql( {
        slug: 'hello-world',
        image: null,
        title: 'Hello World'
      } );

      _.pick( result, [ 'valid', 'success', 'errors' ] ).should.eql( {
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

      _.pick( result.agenda, [ 'slug', 'title', 'description' ] ).should.eql( {
        slug: 'courbevoie',
        title: 'Courbevoie',
        description: 'Que faire à Courbevoie'
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
    }, () => {} );

  } );


  it( 'set in create mode returns internal values if internal option is true', done => {

    svc.set( {
      ownerId: 1,
      title: 'Seconde guerre punique',
      description: 'Evénements d\'une rando en Espagne/France/Italie'
    }, { internal: true }, ( err, result ) => {

      should( err ).equal( null );

      _.isObject( _.get( result, 'agenda.credentials' ) ).should.equal( true );

      done();

    } );

  } );

} );
