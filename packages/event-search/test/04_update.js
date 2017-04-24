"use strict";

const should = require( 'should' );
const config = require( '../testconfig' );
const events = require( 'events-service/test/service' );
const service = require( '../' );

describe( 'event search - functional: update', function() {

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

  it( 'udpate the title of an event', done => {

    service( 'test_index' ).update( { uid: 1 }, {
      title: {
        fr: 'Look at me. I am the title now.'
      }
    }, { refresh: true }, ( err, result ) => {

      should( err ).equal( null );

      service( 'test_index' ).search( { uid: 1 }, ( err, events, total ) => {

        events[ 0 ].title.should.eql( {
          fr: 'Look at me. I am the title now.'
        } );

        done();

      } );

    } );

  } );

  it( 'updating the title means change can be searched after update', done => {

    service( 'test_index' ).update( { uid: 2 }, {
      title: {
        en: 'Witness me!'
      }
    }, { refresh: true }, ( err, result ) => {

      should( err ).equal( null );

      service( 'test_index' ).search( { search: 'Witness' }, ( err, events, total ) => {

        total.should.equal( 1 );

        events[ 0 ].title.should.eql( {
          en: 'Witness me!', 
          fr: 'Trié: Presque le plus dans le futur' 
        } );

        done();

      } );

    } );

  } );

} );