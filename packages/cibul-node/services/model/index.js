"use strict";

const w = require( 'when' );
const _ = require( 'lodash' );
const config = require( '../../config' );
const log = require( '@openagenda/logs' )( 'legacyModel' );
const onError = require( '../00_errors' ).bind( null, 'legacyModel' );

const cache = require( '../cache' );

const model = require( 'cibulModel' )( config.db, {
  imagePath: config.aws.imageBucketPath,
  cache: cache,
  query
} );

module.exports = model;

module.exports.init = c => {}


function query( sql, dirtyArgs = [], cb ) {

  let arr = _.isArray( dirtyArgs ) ? dirtyArgs : [ dirtyArgs ];

  log( 'running \'%s\' with values [%s]', sql, [].concat( arr ).join( ',' ) );

  const p = config.knex.raw.apply( null, arr.length ? [ sql, arr ] : [ sql ] );

  w( p ).done( 
    result => cb( null, result[ 0 ] ), 
    err => {

      onError( err );

      cb( err );

    }
  );

}