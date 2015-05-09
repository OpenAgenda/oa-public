"use strict";

var config = require( '../../config' ),

cache = require( '../cache' );

cache.init( config.useCache ? config.redis : false );

module.exports = require( 'cibulModel' )( config.db, {
  imagePath: config.aws.imageBucketPath, 
  cache: cache
} );