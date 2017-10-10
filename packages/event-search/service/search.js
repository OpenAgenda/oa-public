"use strict";

const config = require( './config' );
const h = require( './helpers' );
const _ = require( 'lodash' );
const VError = require( 'verror' );
const validateNav = require( './query/validateNav' );
const validateOptions = require( './query/validateOptions' );
const parseQuery = require( './query' );
const buildAggregationDsl = require( './aggregation' );
const parseAggregationResult = require( './aggregation' ).parseResult;


module.exports = _.extend( search, {
  dsl,
  scroll
} );


async function scroll( scrollId, scroll ) {

  const res = await config.client.scroll( { scrollId, scroll } );

  return {
    events: res.hits.hits.map( h => h[ '_source' ] ),
    total: res.hits.total
  }

}


async function dsl( alias, dsl, options = {} ) {

  const search = {
    type: config.type,
    index: alias,
    body: dsl
  };

  [ 'scroll' ].forEach( f => {

    search[ f ] = options[ f ];

  } );

  const res = await config.client.search( search );

  return _.extend( {
    events: res.hits.hits.map( h => h[ '_source' ] ),
    total: res.hits.total,
    scrollId: res[ '_scroll_id' ],
    searchAfter: dsl.sort && res.hits.hits.length ? res.hits.hits[ res.hits.hits.length - 1 ].sort : null
  }, dsl.aggregations ? {
    aggregations: res.aggregations
  } : {} )

}

async function search( alias, query, nav = {}, options = {} ) {

  let cleanNav = {}, cleanOptions = {}, cleanDsl;

  try {

    cleanNav = validateNav( nav );

  } catch( e ) {

    throw new VError( e, 'nav is not valid' );

  }

  try {

    cleanOptions = validateOptions( options );

  } catch ( e ) {

    throw new VError( e, 'options are not valid' );

  }

  cleanDsl = parseQuery( 
    query, 
    cleanNav.size !== undefined ? cleanNav : {},
    cleanOptions.extensions,
    // includes
    ( cleanOptions.detailed ? config.detailedSearchIncludes.concat( cleanOptions.extensions ) : config.baseSearchIncludes )
  );


  if ( cleanOptions.aggregations ) {

    cleanDsl.aggregations = buildAggregationDsl( cleanOptions.aggregations, config.predefinedAggregations, query );

  }

  let { events, total, aggregations } = await dsl( alias, cleanDsl, cleanNav.scroll ? cleanNav : {} );

  const eventParsers = _buildEventParsers( cleanOptions, aggregations );

  const parsedEvents = _parseEvents( eventParsers, events );

  if ( options.aggregations ) {

    aggregations = parseAggregationResult( options.aggregations, aggregations, config.predefinedAggregations, _parseEvents.bind( null, eventParsers ) );

  }

  return _.extend( {
    total,
    events: parsedEvents
  }, aggregations ? { aggregations } : {} );

}


function _parseEvents( parsers, events ) {

  return events.map( e => {

    parsers.forEach( p => {

      e = p( e );

    } );

    return e;

  } );

}


function _buildEventParsers( options, aggregations ) {

  let parsers = [ h.convertToLocalTimezone ];

  if ( options.merge ) {

    parsers.push( _merge.bind( null, options.merge ) );

  }

  parsers.push( h.appendNextAndLastTiming );

  if ( !options.detailed ) {

    parsers.push( h.removeTimingsAndTimezone );

  }

  return parsers;

}


function _merge( rules, event ) {

  let merged = {}, clean = {}, mergedFields = [];

  Object.keys( rules ).forEach( r => {

    merged[ r ] = {};

    rules[ r ].forEach( fieldToBeMerged => {

      mergedFields.push( fieldToBeMerged );

      _.assign( merged[ r ], event[ fieldToBeMerged ] );

    } );

  } );

  return _.extend( _.omit( event, mergedFields ), merged );

}