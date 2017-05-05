"use strict";

const users = require( 'users' );

let log = console.log;

module.exports = ( identifiers, cb ) => {

  users.get( identifiers, cb );

}

module.exports.setLog = l => log = l;