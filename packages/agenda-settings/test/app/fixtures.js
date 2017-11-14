"use strict";

const config = require( '../../testconfig.js' );
const agendasSvc = require( '@openagenda/agendas/service/test' );
const keysSvc = require( '@openagenda/keys' );
const fixtures = require( '@openagenda/fixtures' );

fix().catch( console.error );

async function fix() {

  fixtures.init( config );

  await keysSvc.init( config );

  agendasSvc.init( config );

  agendasSvc.test.fixtures( err => {

    if ( err ) {
      console.error( err );
      process.exit( 1 );
    }

    process.exit();

  } );

}
