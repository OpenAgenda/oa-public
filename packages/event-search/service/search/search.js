"use strict";

const _ = require( 'lodash' );
const dsl = require( './dsl' );
const h = require( '../helpers' );
const VError = require( 'verror' );
const config = require( '../config' );
const parseQuery = require( '../query' );
const validateNav = require( '../query/validateNav' );
const buildAggregationDsl = require( '../aggregation' );
const validateOptions = require( '../query/validateOptions' );
const parseAggregationResult = require( '../aggregation' ).parseResult;


module.exports = async ( alias, query, nav = {}, options = {} ) => {

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