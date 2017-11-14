"use strict";

const wn = require( 'when/node' );
const path = require( 'path' );
const agendasSvc = require( '@openagenda/agendas/service/test' );
const stakeholdersSvc = require( '@openagenda/agenda-stakeholders/test/service' );
const fixtures = require( '@openagenda/fixtures' );
const config = require( '../../testconfig.js' );

fix().catch( err => {
  console.error( err );
  process.exit( 1 );
} );

async function fix() {

  fixtures.init( config );
  agendasSvc.init( config );
  stakeholdersSvc.init( config, () => {

    stakeholdersSvc.tasks.message();

  } );

  await wn.call( agendasSvc.test.fixtures, [
    'occurrence',
    'legacy_credential_set'
  ], { reset: true } );

  await wn.call( stakeholdersSvc.initAndLoad, config, { reset: false } );

  await wn.call( fixtures, [ {
    table: 'user',
    src: path.resolve( __dirname, '../fixtures/user.data.sql' )
  }, {
    table: 'api_key_set',
    src: path.resolve( __dirname, '../fixtures/api_key_set.data.sql' )
  } ], { reset: false } );

}
