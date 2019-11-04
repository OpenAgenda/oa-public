"use strict";

const should = require( 'should' );

const events = require('@openagenda/events/test/service');

const Service = require('../');

const config = require('../testconfig');

describe( 'event search - functional: deleteIndex', function() {

  describe( 'simple', function() {

    let service;

    this.timeout( 10000 );

    before( done => {

      events.initAndLoad( config.eventService, [ {
        table: 'event',
        src: __dirname + '/service/event.data.sql'
      } ], { reset: true }, done );

    } );

    before(async () => {

      service = Service(config);

    });

    it( 'indices and alias are effectively removed', async () => {

      await service( 'simple_search' ).rebuild( {
        eventsList: function( offset, limit ) {

          return events.list( offset, limit, {
            internal: true,
            detailed: true
          } ).then( r => r.events );

        }
      } );

      let client = service.getConfig().client,

        indices = Object.keys( await client.indices.getAlias( {
          name: 'simple_search'
        } ) );

      ( await client.indices.existsAlias({ name: 'simple_search' } ) ).should.equal( true );

      await service( 'simple_search' ).deleteIndex();

      while ( indices.length ) {

        ( await client.indices.exists( { index: indices.pop() } ) ).should.equal( false );

      }

      ( await client.indices.existsAlias({ name: 'simple_search' } ) ).should.equal( false );

    } );

  } );

} );
