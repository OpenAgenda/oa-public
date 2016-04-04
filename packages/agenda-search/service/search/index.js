"use strict";

var search = require( './search' ),

obj = require( './agenda' );

module.exports = function( service, cfg ) {

  return search( obj, service, cfg );

}