"use strict";

const logger = require( 'basic-logger' );
const get = require( './get' );
const open = require( './open' );

const { callbackify } = require( './helpers' );

let log = console.log;

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

  return await open.promise( request, { uid: user.uid } );

}

module.exports.init = () => {

  log = logger( 'sync' );

}