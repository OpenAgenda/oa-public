"use strict";

const should = require( 'should' );
const config = require( '../testconfig' );
const sessions = require( '../' )

describe( 'session - functional (server): initialization', () => {

  it( 'uninitialized service will return error when an attempt is made to use it', done => {

    sessions.open( {}, { uid: 123 }, ( err, result ) => {

      err.message.should.equal( 'service has not been initialized' );

      done();

    } );

  } );

  it( 'initialize service prior to use', done => {

    sessions.init( config );

    sessions.open( { cookies: {} }, { uid: 123 }, ( err, result ) => {

      should( err ).equal( null );

      done();

    });

  } );

} );
