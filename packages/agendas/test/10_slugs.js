"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );

const config = require( '../testconfig' );
const svc = require( '../' );

describe( 'agendas - functional (server): slugs', function() {

  this.timeout( 30000 );

  before( () => {

    svc.init( config );

  } );

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

  describe( 'isTaken', function() {

    it( 'finds that slug is taken', done => {

      svc.slugs.isTaken( 'agenda-culturel-auvergne', ( err, result ) => {

        should( err ).equal( null );

        result.should.eql( {
          taken: true,
          valid: true,
          errors: []
        } );

        done();

      } );

    } );

    it( 'finds that slug is not taken', done => {

      svc.slugs.isTaken( 'tapetonslugunique', ( err, result ) => {

        should( err ).equal( null );

        result.should.eql( {
          taken: false,
          valid: true,
          errors: []
        } );

        done();

      } );

    } );

    it( 'finds that slug is not valid', done => {

      svc.slugs.isTaken( 'This is not a slug', ( err, result ) => {

        should( err ).equal( null );

        result.should.eql( {
          taken: null,
          valid: false,
          errors: [ {
            field: undefined,
            code: 'slug.invalid',
            message: 'only small case characters, numbers or dashes are allowed',
            origin: 'This is not a slug'
          } ]
        } );

        done();

      } );

    } );


  } );

} );