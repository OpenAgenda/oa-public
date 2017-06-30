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

  before( async () => {

    service.init( config );

    // list must be prepared to give all needed data
    // for index
    function eventsList( offset, limit, cb ) {

      events.list( offset, limit, {
        internal: true,
        detailed: true
      }, cb );

    }

    await service( 'test_index' ).rebuild( {
      eventsList
    } );

  } );

  it( 'udpate the title of an event', async () => {

    let result = await service( 'test_index' ).update( { uid: 1 }, {
      title: {
        fr: 'Look at me. I am the title now.'
      }
    }, { refresh: true } );

      
    let { events, total } = await service( 'test_index' ).search( { uid: 1 } );

    events[ 0 ].title.should.eql( {
      fr: 'Look at me. I am the title now.'
    } );

  } );

  it( 'updating the title means change can be searched after update', async () => {

    let result = await service( 'test_index' ).update( { uid: 2 }, {
      title: {
        en: 'Witness me!'
      }
    }, { refresh: true } );

    let { events, total } = await service( 'test_index' ).search( { search: 'Witness' } );

    total.should.equal( 1 );

    events[ 0 ].title.should.eql( {
      en: 'Witness me!', 
      fr: 'Trié: Presque le plus dans le futur' 
    } );

  } );

} );