"use strict";

const should = require( 'should' );
const service = require( './service' );
const config = require( '../testconfig' );

describe( 'invitations - functional (server): initialization', function () {

  this.timeout( 60000 );

  it( 'if the service is not initialized, endpoints will throw an error', () => {

    return service.assign( { email: 'test@gmail.com', token: 'fqfdsqfsdsq' }, 'adminCreate', {} )
      .then( () => {

        throw new Error( 'Then is called but should not' );

      } )
      .catch( err => {

        err.should.equal( 'service not initialized' );

      } );

  } );

  it( 'initialize using .init()', done => {

    service.init( config, err => {

      should( err ).equal( undefined );

      done();

    } )

  } );

  it( 'when testing use .initAndLoad to load fixtures at init', done => {

    service.initAndLoad( config, err => {

      should( err ).equal( undefined );

      done();

    } );

  } );

  it( '.initAndLoad can take the names of the fixture files to load', done => {

    service.initAndLoad( config, [
      'invitation'
    ], err => {

      should( err ).equal( undefined );

      done();

    } );

  } );

} );
