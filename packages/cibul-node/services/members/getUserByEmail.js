"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'services/members/getUserByEmail' );
const app = require( '../../app' );

module.exports = async email => {
  log( 'processing', email );

  return app.service( '/users' ).findOne( {
    query: { email }
  } ).then( u => u && _.pick( u, [ 'id', 'uid', 'fullName' ] ) );
}
