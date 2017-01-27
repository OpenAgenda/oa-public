"use strict";

const async = require( 'async' );
const express = require( 'express' );

let config;

module.exports = {
  init: c => config = c,
  roundTrip,
  launchTestApp
}

function launchTestApp( routes ) {

  let app = express();

  Object.keys( routes ).forEach( k => {

    if ( k === 'use' ) {

      return app.use( routes[ k ] );

    }

    let [ method, path ] = k.split( ':' );

    [].concat( routes[ k ] ).forEach( r => app[ method ]( path, r ) );

  } );

  return app.listen( 3000 );

}

function roundTrip( req, res ) {

  res.send( 'ok' );

}