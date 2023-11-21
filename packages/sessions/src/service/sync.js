"use strict";

const get = require( './get' );
const open = require( './open' );

const { callbackify } = require( './helpers' );

module.exports = (config, request, cb ) => {

  callbackify( sync( config, request ), cb );

}

async function sync( config, request ) {

  let user = await get.promise( config, request );

  if ( !user ) {

    return {
      success: false,
      errors: [ {
        code: 'session.notfound'
      } ]
    }

  }

  return await open.promise( config, request, null, { uid: user.uid } );

}
