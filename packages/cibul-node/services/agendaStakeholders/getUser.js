"use strict";

const { callbackify } = require( 'util' );
const users = require( '@openagenda/users' );

let log = console.log;

module.exports = ( identifiers, cb ) => {

  callbackify( users.findOne )( {
    query: identifiers
  }, cb )

}

module.exports.setLog = l => log = l;