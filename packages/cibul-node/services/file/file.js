"use strict";

var log = require( '../../lib/logger' )( 'local file service' ),

lib = require( '../../lib/lib' ),

http = require( 'http' ),

async = require( 'async' ),

fs = require( 'fs' )

module.exports = {
  remove: remove
}

function remove( filename, cb ) {

  if ( !lib.isArray( filename ) ) {

    filename = [ filename ];

  }

  async.each( filename, fs.unlink, function( err ) {

    if ( err ) log( 'error', err );

    if ( cb ) cb( err );

  } );

}