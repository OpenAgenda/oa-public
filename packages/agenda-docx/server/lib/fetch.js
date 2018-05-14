"use strict";

const fs = require( 'fs' );
const sa = require( 'superagent' );

module.exports = {
  fetchAndStoreEvents,
  loadEventsFromFile,
  loadAgendaDetails
}

function loadEventsFromFile( file ) {

  return new Promise( ( rs, rj ) => {

    fs.readFile( file, 'utf-8', ( err, content ) => {

      if ( err ) return rj( err );

      rs( JSON.parse( content ) );

    } );

  } );

}


async function loadAgendaDetails( agendaUid ) {

  return sa.get( `https://openagenda.com/agendas/${agendaUid}/settings.json` ).then( result => result.body );

}


async function fetchAndStoreEvents( destFolder, agendaUid ) {

  const limit = 100;
  let offset = 0, fetched = [], events = [];

  while( ( fetched = await _fetch( agendaUid, offset, limit ) ).length ) {

    events = events.concat( fetched );
    offset += limit;

  }

  return new Promise( ( rs, rj ) => {

    const filePath = destFolder + '/' + agendaUid + '.events.json';

    fs.writeFile( filePath, JSON.stringify( events, null, 3 ), 'utf-8', err => {

      if ( err ) return rj( err );

      rs( filePath );

    } );

  } );

}

function _fetch( agendaUid, offset, limit ) {

  return sa.get( `https://openagenda.com/agendas/${agendaUid}/events.json`, {
    offset, limit
  } ).then( result => result.body.events );

}