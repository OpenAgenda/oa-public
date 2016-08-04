"use strict";

var qs = require( 'qs' ),

utils = require( 'utils' ),

clientSide = !!document;

/**
 * lib for processing list state
 * makes updates to location href when on 
 * client side accordingly
 */

module.exports = clientSide ? href : obj;

function obj( query ) {

  return {
    get: () => query
  }

}

function href( query ) {

  // state is held in window.location.href

  return {
    get: get,
    set: set
  }

}


module.exports = function( query ) {

  var clientSide = !!document,

  current = query.oas ? JSON.parse( JSON.stringify( query.oas ) ) : {};

  if ( clientSide ) current = _getFromHref();

  return get;

  function get() {

    return current;

  }

  function _getFromHref() {

    let parts = document.location.href.split( '?' );

    if ( parts.length < 2 ) return {};

    let query = qs.parse( parts[ 1 ] );

    return query.oas || {};

  }

}