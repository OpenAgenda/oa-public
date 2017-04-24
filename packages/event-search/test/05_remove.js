"use strict";

const should = require( 'should' );
const config = require( '../testconfig' );
const events = require( 'events-service/test/service' );
const service = require( '../' );

describe( 'event search - functional: remove', function() {

  this.timeout( 10000 );

  before( done => {

    events.initAndLoad( config.eventService, [ {
      table: 'event',
      src: __dirname + '/service/event.data.sql' 
    } ], { reset: true }, done );

  } );

  before( done => {

    service.init( config );

    // list must be prepared to give all needed data
    // for index
    function list( offset, limit, cb ) {

      events.list( offset, limit, {
        internal: true,
        detailed: true
      }, cb );

    }

    service( 'test_index' ).rebuild( {
      eventsList: list
    }, done );

  } );

  it( 'remove an event from index by uid', done => {

    service( 'test_index' ).remove( { uid: 1 }, { refresh: true }, ( err, result ) => {

      should( err ).equal( null );

      result.success.should.equal( true );

      done();

    } );

  } );

} );