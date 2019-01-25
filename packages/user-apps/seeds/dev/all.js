"use strict";

const { promisify } = require( 'util' );
const usersSvc = require( '@openagenda/users/test/service' );
const keysSvc = require( '@openagenda/keys' );
const unsubscribedSvc = require( '@openagenda/unsubscribed/test/service' );

exports.seed = async knex => {
  const { testconfig } = knex.client.config;

  await usersSvc.initAndLoad( testconfig, [ 'user', 'api_key_set', 'user_token' ] );
  await keysSvc.init( { ...testconfig, migrations: true } );
  await usersSvc.initAndLoad( testconfig, [ 'key' ], { reset: false } );
  await promisify( unsubscribedSvc.initAndLoad )( testconfig, { reset: false } );
};
