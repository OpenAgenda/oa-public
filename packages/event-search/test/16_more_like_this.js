"use strict";

const should = require( 'should' );
const fs = require( 'fs' );

const config = require( '../testconfig' );

const events = require( 'events-service/test/service' );
const contributors = require( './service/contributors' );

const custom = JSON.parse( fs.readFileSync( __dirname + '/service/custom.json', 'utf-8' ) );
const service = require( '../' );
const _ = require( 'lodash' );

describe( 'event search - functional: more like this', function() {

  describe( 'simple', function() {

    this.timeout( 20000 );

    before( done => {

      events.initAndLoad( config.eventService, [ {
        table: 'event',
        src: __dirname + '/service/event.data.sql'
      } ], { reset: true }, done );

    } );

    before( async () => {

      let i = 0;

      service.init( config );

      // list must be prepared to give all needed data
      // for index
      function eventsList( offset, limit ) {

        return events.list( offset, limit, {
          internal: true,
          detailed: true
        } ).then( r => r.events.map( e => {

          e.contributor = contributors[ i ];

          e.contributor.uid = i++;

          return e;

        } ) );

      }

      await service( 'simple_search' ).rebuild( { eventsList } );

    } );

    /* it.only( 'fleshing it out', async () => {

      const result = await service( 'simple_search' ).moreLikeThis( { uid: 2 } );

      //console.log( result );

    } ); */


  } );


} );