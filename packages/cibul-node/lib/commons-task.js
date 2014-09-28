exports.makeLoad = makeLoad;
exports.getCibulModel = getCibulModel;       // get model instance
exports.makeGenUrl = makeGenUrl;             // proxy for router url generating function


var lib = require( './lib' ),

config = require( '../config' ),

model = require( 'cibulModel' )( config.db, config.redis, { imagePath: config.aws.imageBucketPath } ),

router = require( './router' );


/**
 * prepare task for periodic and offsetted runs
 */

function makeLoad( run ) {

  var params = {
    period: false,  // periodicity of the task
    bootOffset: 0   // offset time at which task will do its first run
  }

  return function( options ) {

    lib.extend( params, options );

    setTimeout( function() {

      run();

      if ( params.period !== false ) setInterval( run, params.period );

    }, params.bootOffset );

  }

}


/**
 * get a model instance
 */

function getCibulModel() {

  return model;

}


/**
 * proxy for router function of same name
 */

function makeGenUrl() {

  var args = Array.prototype.slice.call( arguments );

  return router.makeGenUrl.apply( null, args );

}