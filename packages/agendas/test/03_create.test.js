"use strict";

const _ = require( 'lodash' );
const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig
} = require( '../testconfig.sample.js' );
const svc = require( '../service/index.js' );

describe( 'agendas - functional (server): set (create)', function() {
  beforeAll( require( './fixtures/load.js' ).bind( null, {
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

  beforeAll( () => svc.init( {
    ...config,
    Files: Files(dConfig.files)
  } ) );

  afterEach( () => svc.init( {
    ...config,
    Files: Files(dConfig.files)
  } ) );

  it( 'simplest create is with a title, a description and an owner', done => {

    svc.set( {
      ownerId: 12,
      title: 'Hello World',
      description: 'This is necessary'
    }, ( err, result ) => {

      expect(err).toBeNull();

      expect(_.pick( result.agenda, [ 'slug', 'image', 'title' ] )).toEqual( {
        slug: 'hello-world',
        image: null,
        title: 'Hello World'
      } );

      expect(_.pick( result, [ 'valid', 'success', 'errors' ] )).toEqual( {
        valid: true,
        success: true,
        errors: []
      } );

      done();

    } );

  } );

  it( 'create works through a promise', async () => {
    const { agenda } = await svc.set( {
      ownerId: 12,
      title: 'Hello World',
      description: 'This is necessary'
    } );

    expect(agenda.title).toBe('Hello World');
  });


  it( 'title and description are mandatory', done => {

    svc.set( {
      ownerId: 3
    }, ( err, result ) => {

      expect(err).toBeNull();

      expect(result.valid).toBe( false );

      expect(result.errors).toEqual( [ {
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

      expect(err).toBeNull();

      expect(_.pick( result.agenda, [ 'slug', 'title', 'description' ] )).toEqual( {
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

      expect(result.agenda.id).toBeUndefined();

      done();

    } );

  } );


  it( 'set in create mode calls onCreate callback with created agenda including internal values', done => {

    svc.init( Object.assign( {}, config, {
      Files: Files(dConfig.files),
      interfaces: {
        onCreate: ( agenda ) => {

          expect(agenda.title).toBe( 'Niargl' );

          expect( agenda.id ).not.toBeUndefined();

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

      expect(err).toBeNull();

      expect(_.isObject( _.get( result, 'agenda.credentials' ) )).toBe(true);

      done();

    } );

  } );

} );
