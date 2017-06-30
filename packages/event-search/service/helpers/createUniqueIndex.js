"use strict";

const w = require( 'when' ),

  async = require( 'async' ),

  createIndexName = require( './createIndexName' );

/**
 * create index name and test uniqueness
 */
module.exports = async function( client, alias, settings ) {

  const indexName = await _createUniqueIndexName( client, alias );

  return await _createIndex( client, indexName, settings );

}


async function _createUniqueIndexName( client, alias, cb ) {

  let alreadyExists = null,

    name = createIndexName( alias ),

    indexName;

  while ( alreadyExists === null || alreadyExists ) {

    indexName = name;

    if ( alreadyExists !== null ) {

      indexName += '_' + Math.ceil( Math.random() * 1000 );

    }

    alreadyExists = await _exists( client, indexName );

  }

  return indexName;

}


function _exists( client, index ) {

  let d = w.defer();

  client.indices.exists( { index }, ( err, exists ) => {

    if ( err ) return d.reject( err );

    d.resolve( exists );

  } );

  return d.promise;

}


function _createIndex( client, indexName, settings ) {

  let d = w.defer();

  client.indices.create( {
    index: indexName,
    body: settings
  }, err => {

    if ( err ) return d.reject( err );

    d.resolve( indexName );  

  } );

  return d.promise;

}