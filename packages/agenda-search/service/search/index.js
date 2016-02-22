"use strict";

var search = require( './search' ),

obj = require( './agenda' );

module.exports = function( db, cfg ) {

  return search( obj, db, cfg );

}