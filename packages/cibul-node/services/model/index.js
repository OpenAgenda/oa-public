"use strict";

var config = require( '../../config' ),

cache = require( '../cache' ),

modelLib = require( 'cibulModel' ),

model = modelLib( config.db, {
  imagePath: config.aws.imageBucketPath, 
  cache: cache,
  query
} );

const logger = require( 'logger' );

let log = console.log;

module.exports = model;

module.exports.fixtures = modelLib.fixtures( model );

module.exports.fixtureSets = modelLib.fixtureSets( model );

module.exports.init = c => {

  log = logger( 'services/model' );

}


function query( sql, arr = [], cb ) {

  log( 'running cibul model query \'%s\' with values [%s]', sql, arr.join( ',' ) );

  const p = config.knex.raw( sql, arr );

  p.catch( cb );

  p.then( result => {

    cb( null, result[ 0 ] );

  } );

}