"use strict";

const { callbackify } = require( 'util' );
const usersSvc = require( '../../services/users' );

let log = console.log;

module.exports = ( identifiers, cb ) => {

  callbackify( usersSvc.findOne ).call( usersSvc, {
    query: identifiers
  }, cb )

}

module.exports.setLog = l => log = l;
