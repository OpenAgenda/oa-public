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

async function indexBulk( client, indexName, type, parsedEvents, { expire } ) {

  const body = _.flatten( parsedEvents.map( e => [ {
    index: {
      _index: indexName,
      _type: type,
      _id: e.uid,
      _ttl: expire && e.timings ? lastTimingEndsIn( e.timings ) + 'd': undefined
    }
  }, e ] ) );

  return await client.bulk( { body } );

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