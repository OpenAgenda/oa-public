"use strict";

const eventSvc = require( '../event' );

const limit = 600000;

module.exports = streamIcsEvents;

function streamIcsEvents( req, res, next ) {

  let stream = req.agenda.searchStream( req.query.oaq );

  let renderedHeader = false;

  let size = 0;

  res.writeHead( 200, {
    'Content-Type': 'text/calendar'
  } );

  stream.on( 'data', data => {

    let chunk = '';

    if ( !renderedHeader )  {

      chunk += eventSvc.getIcsHead( req.agenda, req.lang );

      renderedHeader = true;

    }

    chunk += '\r\n' + _renderEvent( req.agenda, data, req.lang, req.query.oaq || {} );

    size += Buffer.byteLength( chunk, 'utf8' );

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

  return eventSvc.instanciate( eData ).getIcs( agenda, lang );

}
