"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );
const w = require( 'when' );
const lastTimingEndsIn = require( './lastTimingEndsIn' );

module.exports = {
  geoJSON: require( './geoJSON' ),
  monolingual: require( './monolingual' ),
  checkList,
  createIndexName: require( './createIndexName' ),
  createUniqueIndex: require( './createUniqueIndex' ),
  indexBulk,
  extendMapping: require( './extendMapping' ),
  convertToLocalTimezone: require( './convertToLocalTimezone' ),
  lastTimingEndsIn,
  appendNextAndLastTiming: require( './appendNextAndLastTiming' ),
  removeTimingsAndTimezone: require( './removeTimingsAndTimezone' )
}

function indexBulk( client, indexName, type, parsedEvents, { expire } ) {

  let filteredEvents = parsedEvents; 

  // should make events expire when events are passed, so only index upcoming
  if ( expire ) { 

    filteredEvents = parsedEvents.filter( e => e.timings && ( lastTimingEndsIn( e ) > 0 ) );

  }

  if ( !filteredEvents.length ) return null;

  const body = _.flatten( filteredEvents.map( e => [ {
    index: {
      _index: indexName,
      _type: type,
      _id: e.uid,
      _ttl: expire && e.timings ? lastTimingEndsIn( e ) + 'd': undefined
    }
  }, e ] ) );
  
  return client.bulk( {
    body,
    //requestTimeout: 60000 // ms
  } );

}


function checkList( listFunc ) {

  if ( typeof listFunc !== 'function' ) {

    throw new Error( 'list is not a function' ) 

  }

  return listFunc( 0, 1 )

  .catch( err => {

    throw new VError( err, 'provided list failed' );

  } )

  .then( events => {

    if ( !_.isArray( events ) ) {

      throw new VError( 'list function is not giving a list' );

    }

  } );

}
