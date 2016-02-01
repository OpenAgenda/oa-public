"use strict";

var esc = require( 'utils' ).escape,

eventSvc = require( '../event' ),

genUrl = require( '../genUrl' ),

utils = require( 'utils' ),

i18n = require( '../../i18n/i18n' ),

limit = 2000000;

module.exports = function( req, res, next ) {

  var stream = req.agenda.searchStream( req.query.oaq ),

  renderedHeader = false,

  size = 0;

  res.writeHead( 200, {
    'Content-Type': 'text/calendar'
  } );

  stream.on( 'data', data => {

    var chunk = '';

    if ( !renderedHeader )  {

      chunk += _renderHead( req.agenda, req.lang );

      renderedHeader = true;

    }

    chunk += '\n' + _renderEvent( req.agenda, data, req.lang, req.query.oaq || {} );

    size += Buffer.byteLength( chunk, 'utf8');

    res.write( chunk );

    if ( size > limit ) {
     
      stream.pause();

      _end( stream, res );

    }

  } );

  stream.on( 'end', () => {

    _end( stream, res );

  } );

}

function _end( stream, res ) {

  stream = undefined;

  res.write( '\nEND:VCALENDAR' );

  res.end();

}

function _renderEvent( agenda, eData, lang, query ) {

  var ev = eventSvc.instanciate( eData ),

  l = ev.getLocationDetails(),

  repeated, icaled = [],

  today = new Date(),

  url = genUrl( 'agendaEventShow', { 
    slug: agenda.slug,
    eventSlug: ev.slug
  }, { protocol: 'https://' } ),

  truncatedDescription = _esc( utils.truncate( ev.getFreeText(), 30, '...' ) ),

  timings = ev.getTimings();

  ev.switchLanguage( lang );

  repeated = [
    'DTSTAMP:' + _date(),
    'SUMMARY:' + _esc( ev.getDescription() ),
    'DESCRIPTION:' + truncatedDescription + ' ' + i18n( 'see more', lang ) + ': ' + url,
    'STATUS:CONFIRMED',
    'LOCATION:' + l.name + '\\n' + l.address,
    'GEO:' + l.latitude + ';' + l.longitude,
    'URL:' + url,
    'LAST-MODIFIED:' + _date( ev.updatedAt )
  ];

  today = today.getFullYear() + '-' + utils.fZ( today.getMonth() + 1 ) + '-' + utils.fZ( today.getDate() );

  timings.filter( t => timings.length <= 10 || t.start.split( 'T' )[ 0 ] >= today ).forEach( t => {

    icaled = icaled.concat( [
      'BEGIN:VEVENT',
      'UID:' + agenda.uid + '//' + ev.uid + '//' + t.start.split( '.' )[ 0 ].replace( 'T', '//' ),
      'DTSTART:' + _date( t.start ),
      'DTEND:' + _date( t.end )
    ], repeated, [
      'END:VEVENT'
    ] );

  } );

  return icaled.join( '\n' );

}

function _renderHead( agenda, lang ) {

  return [ 
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//' + esc( agenda.title )  + '//agenda::' + lang,
    'METHOD:PUBLISH',
    'X-WR-CALNAME:' + esc( agenda.title ),
    'X-WR-CALDESC:' + esc( agenda.description ),
    'X-WR-RELCALID:' + agenda.uid
  ].join( '\n' );

}


/**
 * format date in ics friendly format
 */

function _date( d ) {

  if ( typeof d === 'object' ) {

    d = JSON.stringify( d );

  } else if ( !d ) {

    d = JSON.stringify( new Date() );

  }

  return d.split( '.' )[ 0 ].replace( /"|\-|\:/g, '' );

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