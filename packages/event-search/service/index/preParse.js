"use strict";

const _ = require( 'lodash' );

const moment = require( 'moment-timezone' );

const dateRange = require( 'date-range' );

const countries = require( 'countries' );

module.exports = event => {

  let countryLabels = _.omit( countries.getLabel( event.location.countryCode ), [ 'code' ] );

  return _.extend( {}, event, {

    country: countryLabels,

    dateRange: _dateRange( event.timings, event.timezone ),

    timings: event.timings.map( t => {

      t.search_internals_begin_from_midnight = _secondsMidnightDiff( event.timezone, t.begin );

      return t;

    } ),

    search_internals_title: _flatten( event.title ),

    search_internals_description: _flatten( event.description ),

    search_internals_last_timing: _reduceToLast( event.timings ),

    search_internals_location: event.location ? {
      lat: event.location.latitude,
      lon: event.location.longitude
    } : null,

    search_internals_languages: _extractLanguages( event, [ 'title', 'description', 'longDescription' ] ),

    search_internals_keywords: _flatten( event.keywords ),

    search_internals_keywords_text: _flatten( event.keywords ),

    search_internals_full_address_text: _fullAddress( event, countryLabels )

  } );

}


function _fullAddress( event, countryLabels ) {

  return [ 
    'location.address',
    'location.city',
    'location.region',
    'location.department'
  ].map( f => _.get( event, f ) )

    .concat( _.keys( countryLabels ).map( l => countryLabels[ l ] ) )

    .join( ' ' );

}


function _dateRange( timings, timezone ) {

  let range = {};

  [ 'fr', 'en' ].forEach( lang => {

    range[ lang ] = dateRange( timings.map( t => ( {
      start: new Date( t.begin ),
      end: new Date( t.end )
    } ) ), lang, timezone );

  } );

  return range;

}

function _extractLanguages( event, fields ) {

  let l = _.uniq( _.flatten( fields.map( f => _.get( event, f, null ) ).filter( v => v ).map( Object.keys ) ) ).filter( l => l );

  return l;

}


function _flatten( value ) {

  return _.flatten( Object.keys( value ).map( k => value[ k ] ) );

}

function _reduceToLast( timings ) {

  return new Date( timings.reduce( ( c, t ) => c === null || t.end > c ? t.end : c , null ) );

}

function _secondsMidnightDiff( timezone, d ) {

  let tz = moment( d ).tz( timezone );

  let seconds = parseInt( tz.format( 'HH' ) ) * 60 * 60 + parseInt( tz.format( 'mm' ) ) * 60 + parseInt( tz.format( 'ss' ) );

  return seconds;

}