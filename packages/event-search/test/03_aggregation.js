"use strict";

const should = require( 'should' );
const fs = require( 'fs' );

const config = require( '../testconfig' );

const events = require( '@openagenda/events/test/service' );
const contributors = require( './service/contributors' );

const custom = JSON.parse( fs.readFileSync( __dirname + '/service/custom.json', 'utf-8' ) );
const service = require( '../' );
const _ = require( 'lodash' );

const ih = require( 'immutability-helper' );

describe( 'event search - functional: search', function() {

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


    it( 'keyword search, with aggregation', async () => {

      let { aggregations } = await service( 'simple_search' ).search( {
        keyword: 'word'
      }, { size: 0 }, {
        aggregations: [
          'search_internals_keywords',
          { type: 'timings' }
        ]
      } );

      aggregations.should.eql( {
        search_internals_keywords: [
          { key: 'clé', count: 1 },
          { key: 'key', count: 1 },
          { key: 'mot', count: 1 },
          { key: 'word', count: 1 }
        ],
        timings: [ {
          key: '2010-04-01', count: 2
        } ]
      } );

    } );


    it( 'keyword search with timespan aggregation', async () => {

      let { aggregations, events } = await service( 'simple_search' ).search( {
        keyword: 'word'
      }, { size: 2 }, {
        detailed: true, // timings is not part of standard, if timespan is
        aggregations: [ { type: 'timespan' } ]
      } );

      JSON.stringify( aggregations ).should.eql( '{"timespan":{"first":"2010-04-01T14:00:00.000Z","last":"2010-04-01T22:00:00.000Z"}}' );

    } );

    it( 'keyword search using predefined aggregation', async () => {

      service.init( ih( config, {
        predefinedAggregations: {
          $set: {
            keywords: {
              type: 'terms',
              field: 'search_internals_keywords',
              destination: 'keywords'
            }
          }
        }
      } ) );

      let { aggregations } = await service( 'simple_search' ).search( {
        keyword: 'word'
      }, { size: 0 }, {
        aggregations: 'keywords'
      } );

      aggregations.should.eql( {
        keywords: [
          { key: 'clé', count: 1 },
          { key: 'key', count: 1 },
          { key: 'mot', count: 1 },
          { key: 'word', count: 1 }
        ]
      } );

    } );


    it( 'search using predefined aggregation on agenda sub-object', async () => {

      service.init( ih( config, {
        predefinedAggregations: {
          $set: {
            agendas: {
              type: 'objectsAsTerms',
              field: 'search_internals_agenda',
              destination: 'agendas'
            }
          }
        }
      } ) );

      let { aggregations } = await service( 'simple_search' ).search( {
        'agendaUid' : [ 7678678, 21475128 ]
      }, { size: 0 }, {
        aggregations: 'agendas'
      } );

      aggregations.agendas.should.eql( [ {
        key: '21475128',
        count: 2,
        agenda: {
          uid: '21475128',
          title: 'France Handball 2017'
        }
      } ] );

    } );

  } );

} );
