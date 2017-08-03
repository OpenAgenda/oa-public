"use strict";

const config = require( '../../testconfig.js' );
const agendasSvc = require( 'agendas/service/test' );
const keysSvc = require( 'keys' );
const fixtures = require( 'fixtures' );

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
