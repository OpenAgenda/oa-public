"use strict";

var log = require( '../../lib/logger' )( 'embed service' ),

config = require( '../../config' ),

model = require( 'cibulModel' )( config.db, config.redis, { imagePath: config.aws.imageBucketPath, useCache: config.db.cache } ),

lib = require( '../../lib/lib' ),

coms = require( '../../lib/coms' ),

parserLib = require( './parser' );

module.exports = {
  get: get
}

module.exports.mw = require( './middleware' )( module.exports );

function get( params, cb ) {

  model.reviewEmbeds().get( params, function( err, result ) {

    if ( err ) return cb( err );

    cb( null, instanciate( result ) );

  });

}

function instanciate( data ) {

  var instance = model.reviewEmbeds().instance( data );

  return lib.extend( {}, instance );

}