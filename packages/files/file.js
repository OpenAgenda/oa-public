"use strict";

const _ = require( 'lodash' );
const async = require( 'async' );
const fs = require( 'fs' );
const http = require( 'http' );
const log = require( '@openagenda/logs' )( 'file/file' );

module.exports = { remove };

function remove( filename, cb ) {

  if ( !_.isArray( filename ) ) {

    filename = [ filename ];

  }

  async.each( filename, fs.unlink, function( err ) {

    if ( err ) log( 'error', err );

    if ( cb ) cb( err );

  } );

}