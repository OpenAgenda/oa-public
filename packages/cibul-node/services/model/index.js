"use strict";

var config = require( '../../config' ),

  cache = require( '../cache' ),

  modelLib = require( 'cibulModel' ),

  _ = require( 'lodash' ),

  model = modelLib( config.db, {
    imagePath: config.aws.imageBucketPath,
    cache: cache,
    query
  } );

const w = require( 'when' );

const logger = require( 'logger' );

let log = console.log;

module.exports = model;

module.exports.fixtures = modelLib.fixtures( model );

module.exports.fixtureSets = modelLib.fixtureSets( model );

module.exports.init = c => {

  log = logger( 'services/model' );

}


function query( sql, dirtyArgs = [], cb ) {

  let arr = _.isArray( dirtyArgs ) ? dirtyArgs : [ dirtyArgs ];

  log( 'running cibul model query \'%s\' with values [%s]', sql, [].concat( arr ).join( ',' ) );

  const p = config.knex.raw.apply( null, arr.length ? [ sql, arr ] : [ sql ] );

  w( p ).done( result => cb( null, result[ 0 ] ), cb );

}