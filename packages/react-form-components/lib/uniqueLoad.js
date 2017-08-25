"use strict";

/**
 * ES5 as is not transpiled
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

    loaded = { err, script };

    cbs.forEach( function( cb ) {

      cb( err, script );

    } );

  } );

  add( cb );

  return {
    add
  }

  function add( cb ) {

    if ( loaded ) return cb( loaded.err, loaded.script );

    cbs.push( cb );

  }

}