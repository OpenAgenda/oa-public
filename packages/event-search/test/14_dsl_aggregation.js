"use strict";

const should = require( 'should' );
const config = require( '../testconfig' );
const _ = require( 'lodash' );

const Service = require( '../' );
const runDSLQuery = require('../service/helpers/runDSLQuery');


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

      buildAggregationDsl({}, [ {
        type: 'terms',
        field: 'location.region'
      } ] )

        .should.eql( {
          'location.region': { terms: { field: 'location.region' } }
        } );

    } );


    it( 'in fact, default aggregation is terms aggregation', () => {

      buildAggregationDsl({}, [ 'location.region' ])

         .should.eql( {
          'location.region': { terms: { field: 'location.region' } }
        } );

    } );


    it( 'aggregation configurations can be predefined', () => {

      buildAggregationDsl( {}, [ 'keywords' ], {
        keywords: {
          type: 'terms',
          field: 'search_internals_keywords',
          destination: 'keywords'
        }
      } ).should.eql( { keywords: { terms: { field: 'search_internals_keywords' } } } );

    } );


    it( 'destination aggregation keys can be different from aggregated field name', () => {

      buildAggregationDsl({}, [ {
        type: 'terms',
        field: 'location.region',
        destination: 'locationRegion'
      } ] )

        .should.eql( {
          'locationRegion': { terms: { field: 'location.region' } }
        } );

    } );


    it( 'define a timings aggregation', () => {

      buildAggregationDsl( {}, [ {
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


    it( 'define a timespan aggregation', () => {

      buildAggregationDsl( {}, { type: 'timespan' } )

        .should.eql( {
          "timespan": {
            "nested": {
              "path": "timings"
            },
            "aggs": {
              "first": {
                "min": {
                  "field": "timings.begin"
                }
              },
              "last": {
                "max": {
                  "field": "timings.begin"
                }
              }
            }
          }
        } );

    } );

  } );

  describe( 'parsing aggregation result', function() {

    it( 'parse result of term aggregation', () => {

      parseAggregationResult( {}, [ {
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

      parseAggregationResult( {}, [ {
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

    let service, dslSearch;

    this.timeout( 10000 );

    before( async () => {

      service = Service(config);
      dslSearch = runDSLQuery.bind(null, _.pick(service.getConfig(), ['client', 'type']));

      // list must be prepared to give all needed data
      // for index
      function eventsList( offset, limit ) {

        return new Promise( rs => rs( geohashEvents.slice( offset, offset + limit ) ) );

      }

      await service( 'simple_search' ).rebuild( {
        eventsList
      } );

    } );


    it( 'get min and max dates using stats aggregation', async () => {

      const {
        aggregations
      } = await dslSearch( 'simple_search', {
        query: {}, // whatever
        aggregations: {
          minMaxDays: {
            stats: {
              field: 'search_internals_last_timing' // the last timing of an event.
            }
          }
        }
      } );

      _.pick( aggregations.minMaxDays, [
        'min_as_string',
        'max_as_string'
      ] ).should.eql( {
        min_as_string: '2017-08-03T19:00:00.000Z',
        max_as_string: '2017-08-08T19:00:00.000Z'
      } );

    } );

    it( 'get the min & max timings', async () => {

      // I want the first timing and the last
      const { aggregations } = await dslSearch( 'simple_search', {
        query: {},
        size: 0,
        aggregations: {
          timing_bounds: {
            nested: {
              path: 'timings'
            },
            aggs: {
              first: {
                min: {
                  field: 'timings.begin'
                }
              },
              last: {
                max: {
                  field: 'timings.begin'
                }
              }
            }
          }
        }
      } );

      _.at( aggregations, [ 'timing_bounds.first.value_as_string', 'timing_bounds.last.value_as_string' ] )

        .should.eql( [ '2017-08-02T09:00:00.000Z', '2017-08-08T09:00:00.000Z' ] );

    } );


    it( 'group events by date range, with sample', async () => {

      /**
       * here timings are nested. I need an aggregation giving me the documents
       * matching the nested timings in a histogram ( not necessarily though )
       */

      let dsl = {
        query: {},
        aggregations: {
          days: {
            nested: {
              path: 'timings'
            },
            aggs: {
              day: {
                date_histogram: {
                  field: 'timings.begin',
                  interval: 'day',
                  format: 'YYYY-MM-dd'
                },
                aggs: {
                  day_to_event: {
                    reverse_nested: {},
                    aggs: {
                      top: {
                        "top_hits": {
                          "size" : 3,
                          "sort": [
                            {
                              "timings.begin": {
                                "order": "asc",
                                "mode": "max",
                                "nested_path": "timings"
                              }
                            }
                          ]
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }

      let { events, aggregations } = await dslSearch( 'simple_search', dsl );

      aggregations.days.day.buckets.map( b => b.day_to_event.top.hits.total ).should.eql( [ 1, 1, 0, 2, 0, 1, 1 ] );

      aggregations.days.day.buckets[ 3 ].day_to_event.top.hits.hits.map( h => h._source.uid ).should.eql( [ 2222, 4444 ] );

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
        { key_as_string: '2017-08-05', key: 1501891200000, doc_count: 4 },
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
            terms: { field: 'location.department' }
          }
        }
      };

      let { events, aggregations } = await dslSearch( 'simple_search', dsl );

      aggregations.departmentthingie.buckets.should.eql( [
        {
          key: 'Meuse',
          doc_count: 2
        },
        {
          key: 'Paris',
          doc_count: 2
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

      let {
        events,
        aggregations
      } = await dslSearch( 'simple_search', dsl );

      aggregations.ceteunpeupenible.should.eql( {
        buckets: [
          { key: 'u0ez', doc_count: 2 },
          { key: 'u09w', doc_count: 1 },
          { key: 'u09t', doc_count: 1 }
        ]
      } );

    } );

  } );

} );
