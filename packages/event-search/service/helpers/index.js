"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );
const w = require( 'when' );

module.exports = {
  checkList,
  createIndexName: require( './createIndexName' ),
  createUniqueIndex: require( './createUniqueIndex' ),
  indexBulk,
  extendMapping: require( './extendMapping' )
}

let count = 0;


async function indexBulk( client, indexName, type, parsedEvents ) {

  let body = _.flatten( parsedEvents.map( e => [ {
    index: {
      _index: indexName,
      _type: type,
      _id: e.uid
    }
  }, e ] ) );

  return await client.bulk( { body } );

}


function checkList( listFunc ) {

  if ( typeof listFunc !== 'function' ) {

    throw new Error( 'list is not a function' ) 

  }

  let d = w.defer();

  listFunc( 0, 1, ( err, events ) => {

    if ( err ) {

      return d.reject( new VError( err, 'provided list failed' ) );

    }

    if ( !_.isArray( events ) ) {

      return d.reject( 'list function is not giving a list' );

    }

    return d.resolve();

  } );

  return d.promise;

}