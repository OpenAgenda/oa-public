"use strict";

const fs = require( 'fs' );

const locations = JSON.parse( fs.readFileSync( __dirname + '/location.data.json', 'utf-8' ) );

module.exports = function( uids, options, cb ) {

  // lazy test list func
  //if ( arguments.length === 3 ) return options( null, locations );

  cb( null, locations.filter( l => uids.includes( l.uid ) ) );

}