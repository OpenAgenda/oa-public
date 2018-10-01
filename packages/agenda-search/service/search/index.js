"use strict";

var search = require( './search' ),

obj = require( './agenda' );

module.exports = function( service, cfg ) {

  obj.init( cfg );

  return search( obj, service, cfg );

}