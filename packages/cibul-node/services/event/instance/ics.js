"use strict";

const moment = require( 'moment' );
const utils = require( '@openagenda/utils' );

const genUrl = require( '../../genUrl' );
const i18n = require( '../../../i18n/i18n' );
const esc = utils.escape;


module.exports = function( agenda, eData /* event data */, ev /* event instance */, lang, timingIndex ) {

  const l = ev.getLocationDetails();


  const url = genUrl( 'agendaEventShow', {
    slug: agenda.slug,
    eventSlug: ev.slug
  }, { protocol: 'https://' } );

  const truncatedDescription = _esc( utils.truncate( ev.getFreeText(), 30, '...' ) );

  const timings = ev.getTimings();

  let icaled = [];
  let today = new Date();

  if ( timingIndex === undefined ) {

    timingIndex = -1;

  } else {

    try {

      timingIndex = parseInt( timingIndex );

    } catch( e ) {

      timingIndex = -1;

    }

  }

  ev.switchLanguage( lang );

  const repeated = [
    'DTSTAMP:' + _date(),
    'TZID:' + l.timezone.replace( '/', '-' ) ,
    'SUMMARY:' + _esc( ev.getTitle() ),
    'DESCRIPTION:' + _esc( ev.getDescription() ) + ( truncatedDescription.length ? ' - ' + truncatedDescription : '' ) + ' ' + i18n( 'see more', lang ) + ': ' + url,
    'STATUS:CONFIRMED',
    'LOCATION:' + l.name + ' - ' + l.address,
    'GEO:' + l.latitude + ';' + l.longitude,
    'URL:' + url,
    'LAST-MODIFIED:' + _date( ev.updatedAt )
  ];

  today = today.getFullYear() + '-' + utils.fZ( today.getMonth() + 1 ) + '-' + utils.fZ( today.getDate() );

  timings

  // limit timings if is passed and more than ten
  .filter( ( t, i ) => {

    if ( timingIndex !== -1 ) {

      return timingIndex === i;

    }

    const start = typeof t.start === 'string' ? t.start : t.start.toISOString();

    return i <= 10 || start.split( 'T' )[ 0 ] >= today;

  } )

  .forEach( t => {

    icaled = icaled.concat( [
      'BEGIN:VEVENT',
      'UID:' + agenda.uid + '//' + ev.uid + '//' + _date( t.start, 'YYYY-MM-DD//HH:mm:00' ),
      'DTSTART:' + _date( t.start ),
      'DTEND:' + _date( t.end ),
    ], repeated, [
      'ORGANIZER:OA',
      'END:VEVENT'
    ] );

  } );

  return icaled.join( '\r\n' );

}


module.exports.head = function( agenda, lang = 'fr' ) {

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//' + esc( agenda.title )  + '//agenda::' + lang,
    'METHOD:PUBLISH',
    'X-WR-CALNAME:' + _esc( agenda.title ),
    'X-WR-CALDESC:' + _esc( agenda.description ),
    'X-WR-RELCALID:' + agenda.uid,
  ].join( '\r\n' );

}


/**
 * format date in ics friendly format
 */

function _date( d, format ) {

  if ( !format ) format = 'YYYYMMDDTHHmm00';

  if ( typeof d === 'object' ) {

    d = JSON.stringify( d );

  } else if ( !d ) {

    d = JSON.stringify( new Date() );

  }

  return moment( d.replace( /\"/g, '' ) ).utc().format( format ) + 'Z';

}


/**
 * escape for ical content
 */

function _esc( txt ) {

  return txt

  .replace( /\r/g, ' ' )

  .replace( /\n/g, '\\r\\n' )

  .replace( /,/g, '\\,' )

  .replace( /;/g, '\\;' );

}
