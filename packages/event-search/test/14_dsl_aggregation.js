"use strict";

const _ = require('lodash');
const should = require('should');

const config = require( '../testconfig' );

const Service = require( '../' );
const runDSLQuery = require('../service/helpers/runDSLQuery');

const buildAggregationDsl = require( '../service/aggregation' );

const parseAggregationResult = require( '../service/aggregation' ).parseResult;

const geohashEvents = require('./service/geohashEvents.data');

describe('14 - event-search - unit: dsl aggregation', function() {

  describe('aggregation options to dsl', function() {

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
          field: '_search_keywords',
          destination: 'keywords'
        }
      } ).should.eql( { keywords: { terms: { field: '_search_keywords' } } } );

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

} );
