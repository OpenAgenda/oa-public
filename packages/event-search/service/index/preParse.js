'use strict';

const _ = require('lodash');
const moment = require('moment-timezone');
const countries = require('@openagenda/countries');
const dateRange = require('@openagenda/date-range');

module.exports = (event, part = false) => {
  let countryLabels = null;

  const parsed = {};

  _.keys(event)
    .filter(eventField => !part || (event[ eventField ] !== undefined))
    .forEach(eventField => {

      if (eventField === 'custom') {
        parsed.custom = _custom(event.custom);
      } else if (eventField === 'location') {
        if (!event.location) return;

        parsed.location = event.location;

        const countryLabels = _.omit( countries.getLabel( _.get( event, 'location.countryCode' ) ), [ 'code' ] );

        parsed.country = countryLabels;

        parsed[ '_search_full_address_text' ] = _fullAddress( event, countryLabels );

        parsed[ '_search_location' ] = {
          lat: _.get( event, 'location.latitude' ),
          lon: _.get( event, 'location.longitude' )
        };

      } else if ( eventField === 'timings' ) {

        parsed.dateRange = _dateRange( event.timings, event.timezone );

        parsed[ '_search_last_timing' ] = _reduceToLast( event.timings );

        parsed.timings = event.timings.map( t => {

          t[ '_search_begin_from_midnight' ] = _secondsMidnightDiff( event.timezone, t.begin );

          return t;

        } );

      } else if ( eventField === 'title' ) {

        parsed.title = event.title;

        parsed[ '_search_title' ] = _flatten( event.title )

      } else if ( eventField === 'description' ) {

        parsed.description = event.description;

        parsed[ '_search_description' ] = _flatten( event.description );

      } else if ( eventField === 'keywords' ) {

        parsed.keywords = event.keywords;

        parsed[ '_search_keywords' ] = _flatten( event.keywords );

        parsed[ '_search_keywords_text' ] = _flatten( event.keywords );

      } else if ( eventField === 'agenda' ) {

        if ( !event.agenda ) return;

        parsed.agenda = event.agenda;

        parsed[ '_search_agenda' ] = _.toPairs( _.pick( event.agenda, [ 'uid', 'title', 'image' ] ) ).map( pair => pair.join( ':' ) ).join( '|' );

      } else {

        parsed[ eventField ] = _.get( event, eventField );

      }

  } );

  if ( event.title && event.description ) {

    parsed._search_languages = _extractLanguages( event, [ 'title', 'description', 'longDescription' ] );

  }

  return parsed;

}


function _custom( custom ) {

  const parsed = {
    _search_keywords: []
  };

  _.keys( custom ).forEach( customField => {

    parsed[ customField ] = custom[ customField ];

    // required for more like this on optioned data: works only with stringed keywords
    if ( _.isArray( custom[ customField ] ) || _.isInteger( custom[ customField ] ) ) {

      [].concat( custom[ customField ] ).forEach( customValue => {

        parsed[ '_search_keywords' ].push( 'key' + customValue );

      } );

    }

  } );

  return parsed;

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

  [ 'fr', 'ar', 'en' ].forEach( lang => {

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
