"use strict";

const _ = require( 'lodash' );

var config = require( '../../config' ),

es = require( './es' )( config.es ),

moment = require( 'moment' ),

async = require( 'async' ),

model = require( '../model' );

module.exports = {
  getIndexedEventsByWeek: getIndexedEventsByWeek,
  getIndexDiff: getIndexDiff
};


/**
 *
 * get stats info on indexed events: updated events aggregated
 * over weeks
 *
 */

function getIndexedEventsByWeek( options, cb ) {

  var params = {
    year: ( new Date() ).getFullYear()
  },

  dsl;

  if ( !cb ) {

    cb = options;

    options = {};

  }

  _.merge( params, options );

  dsl = {
    query: {
      bool: {
        should: [ {
          term: {
            original_es: true
          }
        }, {
          range: {
            updatedAt: {
              gte: params.year + "-01-01T00:00:00.000Z"
            }
          }
        }],
        minimum_should_match: 2
      }
    },
    aggs: {
      histogram: {
        date_histogram: {
          field: 'updatedAt',
          interval: 'week'
        }
      }
    }
  };

  es.query( 'event', dsl, function( err, data ) {

    if ( err ) return cb( err );

    cb( null, data.aggregations.histogram.buckets.map( function( d ) {

      return {
        l: moment( d.key_as_string ).format( 'DD MMM' ),
        v: d.doc_count
      }

    }));

  } );

}


/**
 * get difference count between db and search index
 */

function getIndexDiff( cb ) {

  let dbCount;

  const unreferencedQuery = [
    'select count( * ) as unref_count from( ',
      'select e.id',
      'from event as e left join review_article as ra on ra.event_id=e.id and ra.state=2',
      'where e.is_published = 1 and e.is_new = 0',
      'group by e.id having count( ra.id ) = 0',
    ') as x'
  ].join( ' ' );

  const referencedQuery = [
    'select count(ra.id) as ref_count',
    'from review_article as ra',
    'where ra.state = 2'
  ].join( ' ' );

  async.map( [ unreferencedQuery, referencedQuery ], model.lib.query, function( err, results ) {

    if ( err ) return cb( err );

    dbCount = results[ 0 ][ 0 ].unref_count + results[ 1 ][ 0 ].ref_count;

    // total es result for events should be same.

    es.query( 'event', function( err, result ) {

      if ( err ) return cb( err );

      cb( null, dbCount - result.hits.total );

    } );

  });

}
