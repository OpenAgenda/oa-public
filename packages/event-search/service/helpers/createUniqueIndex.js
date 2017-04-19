"use strict";

const w = require( 'when' ),

  async = require( 'async' ),

  createIndexName = require( './createIndexName' );

/**
 * create index name and test uniqueness
 */
module.exports = function( indexSettings, v ) {

  let d = w.defer();

  _createUniqueIndexName( v.client, v.in.alias, ( err, indexName ) => {

    if ( err ) return d.reject( err );

    v.process.indexName = indexName;

    v.client.indices.create( {
      index: indexName,
      body: indexSettings
    }, err => {

      if ( err ) return d.reject( err );

      d.resolve( v );  

    } );

  } );

  return d.promise;

}



function _createUniqueIndexName( client, alias, cb ) {

  let alreadyExists = null,

    name = createIndexName( alias ),

    indexName;

  async.doWhilst( wcb => {

    indexName = name;

    if ( alreadyExists !== null ) {

      indexName += '_' + Math.ceil( Math.random() * 1000 );

    }

    client.indices.exists( {
      index: indexName
    }, ( err, exists ) => {

      if ( err ) return wcb( err );

      alreadyExists = exists;

      wcb();

    } );

  }, () => alreadyExists, err => {

    if ( err ) return cb( err );

    cb( null, indexName );

  } );

}