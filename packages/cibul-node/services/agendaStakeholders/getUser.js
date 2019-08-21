"use strict";

const { callbackify } = require( 'util' );
const app = require( '../../app' );

let log = console.log;

module.exports = ( identifiers, cb ) => {

  callbackify( app.service( '/users' ).findOne )( {
    query: identifiers
  }, cb )

}

module.exports.setLog = l => log = l;
