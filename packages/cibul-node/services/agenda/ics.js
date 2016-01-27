"use strict";

var esc = require( 'utils' ).escape,

eventSvc = require( '../event' ),

genUrl = require( '../genUrl' ),

utils = require( 'utils' );

module.exports = function( req, res, next ) {

  var stream = req.agenda.searchStream( req.query.oaq ),

  renderedHeader = false;

  res.writeHead( 200, {
    'Content-Type': 'text/calendar'
  } );

  stream.on( 'data', data => {

    var chunk = '';

    if ( !renderedHeader )  {

      chunk += _renderHead( req.agenda, req.lang );

      renderedHeader = true;

    }

    chunk += '\n' + _renderEvent( req.agenda, data, req.lang );

    res.write( chunk );

  } );

  stream.on( 'end', () => {

    res.write( '\nEND:VCALENDAR' );

    res.end();

  } );

}

function _renderEvent( agenda, eData, lang, cb ) {

  var ev = eventSvc.instanciate( eData ),

  l = ev.getLocationDetails(),

  repeated, icaled = [];

  ev.switchLanguage( lang );

  repeated = [
    'DTSTAMP:' + _date(),
    'SUMMARY:' + _esc( ev.getDescription() ),
    'DESCRIPTION:' + _esc( ev.getFreeText() ),
    'STATUS:CONFIRMED',
    'LOCATION:' + l.name + '\\n' + l.address,
    'GEO:' + l.latitude + ';' + l.longitude,
    'URL:' + genUrl( 'agendaEventShow', { 
      slug: agenda.slug,
      eventSlug: ev.slug
    }, { protocol: 'https://' } ),
    'LAST-MODIFIED:' + _date( ev.updatedAt )
  ];

  ev.getTimings().forEach( t => {

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