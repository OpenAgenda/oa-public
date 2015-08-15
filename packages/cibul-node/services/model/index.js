"use strict";

var config = require( '../../config' ),

cache = require( '../cache' ),

modelLib = require( 'cibulModel' ),

model = modelLib( config.db, {
  imagePath: config.aws.imageBucketPath, 
  cache: cache
} );

cache.init( config.useCache ? config.redis : false );

module.exports = model;

module.exports.fixtures = modelLib.fixtures( model );

module.exports.fixtureSets = modelLib.fixtureSets( model );