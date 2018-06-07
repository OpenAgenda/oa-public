"use strict";

const { promisify } = require( 'util' );
const unsubscribedSvc = require( '@openagenda/unsubscribed/test/service' );
const usersSvc = require( '@openagenda/users/test/service' );
const config = require( '../../testconfig.js' );

fix().catch( console.error );

async function fix() {

  try {

    await usersSvc.initAndLoad( config );

    await promisify( unsubscribedSvc.initAndLoad )( config, { reset: false } );

  } catch ( e ) {

    console.error( e );
    process.exit( 1 );

  }

}
