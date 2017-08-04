"use strict";

let log = console.log;

module.exports = ( before, after, context ) => {

  log( 'updated event %s with context %s', after.uid, JSON.stringify( context ) );

}

module.exports.setLog = l => log = l;