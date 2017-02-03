"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

svc = require( '../service/test' ),

config = require( '../testconfig' );

describe( 'agendas - functional (server): slugs', function() {

  this.timeout( 30000 );

  before( () => {

    svc.init( config );

  } );

  before( svc.test.fixtures );

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