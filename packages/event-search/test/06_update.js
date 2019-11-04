"use strict";

const should = require( 'should' );
const config = require( '../testconfig' );
const events = require( '@openagenda/events/test/service' );
const Service = require( '../' );

describe( 'event search - functional: update', function() {

  let service;

  this.timeout( 10000 );

  before( done => {

    events.initAndLoad( config.eventService, [ {
      table: 'event',
      src: __dirname + '/service/event.data.sql'
    } ], { reset: true }, done );

  } );

  before( async () => {

    service = Service(config);

    // list must be prepared to give all needed data
    // for index
    function eventsList( offset, limit ) {

      return events.list( offset, limit, {
        internal: true,
        detailed: true
      } ).then( r => r.events );

    }

    await service( 'test_index' ).rebuild( {
      eventsList
    } );

  } );

  it( 'udpate the title of an event', async () => {

    const result = await service( 'test_index' ).update( { uid: 1 }, {
      title: {
        fr: 'Look at me. I am the title now.'
      }
    }, {
      refresh: true
    } );

    const {
      events,
      total
    } = await service( 'test_index' ).search( { uid: 1 } );

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


  describe( 'expiring event', () => {

    it( 'when expiry is set returns includes ttl value', async () => {

      const eventData = {
        timezone: 'Europe/Paris',
        timings: [ {
          begin: ( new Date() ).setDate( ( new Date() ).getDate() + 1 ),
          end: ( new Date() ).setDate( ( new Date() ).getDate() + 1 )
        } ]
      };

      const result = await service( 'test_index' ).update( { uid: 2 }, eventData, { expire: true } );

      result.ttl.should.eql( '1d' );

    } );


    it( 'when expiry is set and update sets event in the past, it is removed from index', async () => {

      const eventData = {
        timezone: 'Europe/Paris',
        timings: [ {
          begin: ( new Date() ).setDate( ( new Date() ).getDate() - 1 ),
          end: ( new Date() ).setDate( ( new Date() ).getDate() - 1 )
        } ]
      };

      const result = await service( 'test_index' ).update( { uid: 2 }, eventData, { expire: true } );

      result.should.eql( {
        success: true,
        message: 'event was removed'
      } );

    } );

  } );

} );
