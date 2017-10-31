"use strict";

/**
 * >>>>> ES5 AS IS NOT TRANSPILED <<<<<<<<<<<
 */

var load = require( 'load-script' );

var loads = {};

module.exports = function( res, cb ) {

  if ( loads[ res ] ) {

    loads[ res ].add( cb );

  } else {

    loads[ res ] = _loader( res, cb );

  }

}

function _loader( res, cb ) {

  var loaded = null, cbs = [];

  load( res, function ( err, script ) {

    loaded = {
      err: err,
      script: script
    };

    cbs.forEach( function( cb ) {

      cb( err, script );

    } );

  } );

  add( cb );

  return {
    add: add
  }

  function add( cb ) {

    if ( loaded ) return cb( loaded.err, loaded.script );

    cbs.push( cb );

  }

}