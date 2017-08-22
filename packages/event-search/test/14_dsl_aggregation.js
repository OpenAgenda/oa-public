"use strict";

const should = require( 'should' );
const config = require( '../testconfig' );

const service = require( '../' );

const dslSearch = require( '../service/search' ).dsl;

const buildAggregationDsl = require( '../service/aggregation' );

const parseAggregationResult = require( '../service/aggregation' ).parseResult;

const geohashEvents = require( './service/geohashEvents.data' );


describe( 'event-search - unit: dsl aggregation', function() {

  describe( 'aggregation options to dsl', function() {

    // when a search is made on the service which requires
    // aggregated results, basic info on the requested aggregation is 
    // passed to the search function. The following ( in this describe ), parses thoe options
    // builds the aggregation dsl

    it( 'define a term aggregation', () => {

      buildAggregationDsl( [ {
        type: 'terms',
        field: 'location.region'
      } ] )

        .should.eql( { 
          'location.region': { terms: { field: 'location.region' } } 
        } );

    } );

    it( 'define a timings aggregation', () => {

      buildAggregationDsl( [ {
        type: 'timings'
      } ] )

        .should.eql( {
          timings: {
            "nested" : {
              "path" : "timings"
            },
            "aggregations" : {
              "timings" : {
                "date_histogram" : {
                  "field" : "timings.begin",
                  "interval" : "day",
                  "format" : "YYYY-MM-dd"
                }
              }
            }
          }
        } );

    } );

  } );

  describe( 'parsing aggregation result', function() {

    it( 'parse result of term aggregation', () => {

      parseAggregationResult( [ {
        type: 'terms',
        field: 'search_internal_keywords'
      } ], {
        search_internal_keywords: {
          "doc_count_error_upper_bound": 0,
          "sum_other_doc_count": 0,
          "buckets": [ {
            "key": "key",
            "doc_count": 1
          } ]
        }
      } ).should.eql( {
        search_internal_keywords: [ {
          "key": "key",
          "count": 1
        } ]
      } )

    } );

    it( 'parse result of timings aggregation', () => {

      parseAggregationResult( [ {
        type: 'timings'
      } ], {
        timings: {
          "doc_count": 2,
          "timings": {
            "buckets": [
              {
                "key_as_string": "2010-04-01",
                "key": 1270080000000,
                "doc_count": 2
              }
            ]
          }
        }
      } ).should.eql( {
        timings: [ {
          key: '2010-04-01',
          count: 2
        } ]
      } )

    } );

  } );

  describe( 'aggregations by geohash, date histogram and region', function() {

    this.timeout( 10000 );
    
    before( async () => {

      service.init( config );

      // list must be prepared to give all needed data
      // for index
      function eventsList( offset, limit ) {

        return new Promise( rs => rs( geohashEvents.slice( offset, offset + limit ) ) );

      }

      await service( 'simple_search' ).rebuild( {
        eventsList
      } );

    } );


    it( 'group events by date range, bounded', async () => {

      let dsl = {
        query: {},
        aggregations: {
          wigglytime: {
            nested: {
              path: 'timings'
            },
            aggregations: {
              datethingie: {
                date_histogram: {
                  field: 'timings.begin',
                  interval: 'day',
                  format: 'YYYY-MM-dd'
                }
              }
            }
          }
        }
      }

      let { events, aggregations } = await dslSearch( 'simple_search', dsl );


      aggregations.wigglytime.datethingie.buckets.should.eql( [ 
        { key_as_string: '2017-08-02', key: 1501632000000, doc_count: 1 },
        { key_as_string: '2017-08-03', key: 1501718400000, doc_count: 1 },
        { key_as_string: '2017-08-04', key: 1501804800000, doc_count: 0 },
        { key_as_string: '2017-08-05', key: 1501891200000, doc_count: 2 },
        { key_as_string: '2017-08-06', key: 1501977600000, doc_count: 0 },
        { key_as_string: '2017-08-07', key: 1502064000000, doc_count: 1 },
        { key_as_string: '2017-08-08', key: 1502150400000, doc_count: 1 }
      ] );

    } );


    it( 'group events by location region', async () => {

      let dsl = {
        query: {},
        aggregations: {
          departmentthingie: {
            terms: { field: 'location.department' }
          }
        }
      };

      let { events, aggregations } = await dslSearch( 'simple_search', dsl );

      aggregations.departmentthingie.buckets.should.eql( [ 
        {
          key: 'Paris',
          doc_count: 2
        },
        {
          key: 'Meuse',
          doc_count: 1
        } 
      ] );

    } );


    it( 'geohash aggregation can be used to get event counts by geohash subdivision', async () => {

      let dsl = {
        query: {},
        aggregations: {
          ceteunpeupenible: {
            geohash_grid: {
              field: 'search_internals_location',
              precision: 4
            }
          }
        }
      };

      let { events, aggregations } = await dslSearch( 'simple_search', dsl );

      aggregations.ceteunpeupenible.should.eql( { 
        buckets: [ 
          { key: 'u0ez', doc_count: 1 },
          { key: 'u09w', doc_count: 1 },
          { key: 'u09t', doc_count: 1 } 
        ] 
      } );

    } );

  } );

} );