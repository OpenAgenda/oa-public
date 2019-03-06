"use strict";

const log = require( '@openagenda/logs' )( 'sync' );
const get = require( './get' );
const open = require( './open' );

const { callbackify } = require( './helpers' );

module.exports = ( request, cb ) => {

  callbackify( sync( request ), cb );

}

async function sync( request ) {

  let user = await get.promise( request );

  if ( !user ) {

    return {
      success: false,
      errors: [ {
        code: 'session.notfound'
      } ]
    }

  }

  return await open.promise( request, null, { uid: user.uid } );

}
