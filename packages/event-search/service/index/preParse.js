"use strict";

const _ = require( 'lodash' );

const moment = require( 'moment-timezone' );

const dateRange = require( 'date-range' );

const countries = require( 'countries' );

module.exports = ( event, part = false ) => {

  let countryLabels = null;

  let parsed = {};

  _.keys( event ).filter( k => !part || ( event[ k ] !== undefined ) ).forEach( k => {

    if ( k === 'location' ) {

      let countryLabels = _.omit( countries.getLabel( event.location.countryCode ), [ 'code' ] );

      _.extend( parsed, {
        country: countryLabels,
        search_internals_full_address_text: _fullAddress( event, countryLabels ),
        search_internals_location: event.location ? {
          lat: event.location.latitude,
          lon: event.location.longitude
        } : null
      } );

    } else if ( k === 'timings' ) {

      _.extend( parsed, {
        dateRange: _dateRange( event.timings, event.timezone ),
        timings: event.timings.map( t => {

          t.search_internals_begin_from_midnight = _secondsMidnightDiff( event.timezone, t.begin );

          return t;

        } ),
        search_internals_last_timing: _reduceToLast( event.timings )
      } )

    } else if ( k === 'title' ) {

      parsed.search_internals_title = _flatten( event.title )

    } else if ( k === 'description' ) {

      parsed.search_internals_description = _flatten( event.description );

    } else if ( k === 'keywords' ) {

      parsed.search_internals_keywords = _flatten( event.keywords );

      parsed.search_internals_keywords_text = _flatten( event.keywords );

    }
    
  } );

  if ( event.title && event.description ) {

    parsed.search_internals_languages = _extractLanguages( event, [ 'title', 'description', 'longDescription' ] );

  }

  return _.extend( {}, event, parsed );

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

  if ( !value ) return null;

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