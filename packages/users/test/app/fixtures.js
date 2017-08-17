"use strict";

const wn = require( 'when/node' );
const unsubscribedSvc = require( 'unsubscribed/test/service' );
const usersSvc = require( '../service' );
const config = require( '../../testconfig.js' );

fix().catch( console.error );

async function fix() {

  try {

    await usersSvc.initAndLoad( config );

    await wn.call( unsubscribedSvc.initAndLoad, config, { reset: false } );

  } catch ( e ) {

    console.error( e );
    process.exit( 1 );

  }

}
