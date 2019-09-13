"use strict";

const w = require( 'when' );
const _ = require( 'lodash' );
const config = require( '../../config' );
const log = require( '@openagenda/logs' )( 'legacyModel' );
const onError = require( '../errors' ).bind( null, 'legacyModel' );

const cache = require( '../cache' );

const model = require( '@openagenda/cibul-model' )( config.db, {
  imagePath: config.aws.imageBucketPath,
  cache,
  query
} );

module.exports = model;

module.exports.init = c => {}


function query( sql, dirtyArgs = [], cb ) {

  const arr = _.isArray( dirtyArgs ) ? dirtyArgs : [ dirtyArgs ];

  log( 'running \'%s\' with values [%s]', sql, [].concat( arr ).join( ',' ) );

  const p = config.knex.raw.apply( config.knex, arr.length ? [ sql, arr ] : [ sql ] );

  w( p ).done(
    result => cb( null, result[ 0 ] ),
    err => {

      onError( err );

      cb( err );

    }
  );

}
