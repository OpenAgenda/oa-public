"use strict";

const should = require( 'should' );
const config = require( '../testconfig' );
const events = require( 'events-service/test/service' );
const service = require( '../' );


describe( 'event search - functional: create', function() {

  this.timeout( 10000 );

  before( done => {

    events.initAndLoad( config.eventService, [ {
      table: 'event',
      src: __dirname + '/service/event.data.sql' 
    } ], { reset: true }, done );

  } );

  before( async () => {

    service.init( config );

    await service( 'test_index' ).rebuild( {
      eventsList: function( offset, limit, cb ) {

        events.list( offset, limit, {
          internal: true,
          detailed: true
        }, cb );

      }
    } );

  } );


  it( 'add an event to an index', async () => {

    let result = await service( 'test_index' ).add( {
      id: 679689,
      uid: 74367684,
      title: {
        fr: 'un nouvel événement',
        en: 'a new event'
      },
      description: {
        fr: 'Une desc courte',
        en: 'A short description'
      },
      location: {
        name : 'La boutique',
        address : '29 passage du Ponceau, Paris"',
        latitude : 48.8675959,
        longitude : 2.3516408,
        district : 'Paris 02',
        city : 'Paris',
        department : 'Paris',
        region : 'Ile-de-France',
        countryCode : 'FR',
        timezone : 'Europe/Paris'
      },
      timings: [ {
        begin: new Date( '2017-04-20T12:00:00+0100' ),
        end: new Date( '2017-04-20T13:00:00+0100' )
      } ],
      timezone: 'Europe/Paris'
    }, { refresh: true } );

    result.success.should.equal( true );

    
    await _timeout( 1000 );
    

    let { events, total } = await service( 'test_index' ).search( { uid: 74367684 } );

    total.should.equal( 1 );

    events[ 0 ].uid.should.equal( 74367684 );

  } );



} );

async function _timeout( ms ) {

  return new Promise( rs => {

    setTimeout( rs, ms );

  } );

}