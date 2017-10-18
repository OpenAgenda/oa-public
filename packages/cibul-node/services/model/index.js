"use strict";

const w = require( 'when' );
const _ = require( 'lodash' );
const logger = require( 'logger' );
const config = require( '../../config' );
const log = require( 'logs' )( 'legacyModel' );
const onError = require( '../00_errors' ).bind( null, 'legacyModel' );

let cache = require( '../cache' ),

  modelLib = require( 'cibulModel' ),

  model = modelLib( config.db, {
    imagePath: config.aws.imageBucketPath,
    cache: cache,
    query
  } );

module.exports = model;

module.exports.fixtures = modelLib.fixtures( model );

module.exports.fixtureSets = modelLib.fixtureSets( model );

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