"use strict";

const should = require( 'should' );
const service = require( './service' );
const config = require( '../testconfig' );

describe( 'agenda-stakeholders - functional (server): initialization', function() {

  this.timeout( 60000 );

  it( 'if the service is not initialized, endpoints will throw an error', () => {

    let error;

    try {

      service.agenda( 123 );

    } catch( e ) { error = e; }

    error.message.should.equal( 'service not initialized' );

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
      'stakeholder_empty'
    ], { reset: true }, err => {

      should( err ).equal( undefined );

      done();

    } );

  } );

} );