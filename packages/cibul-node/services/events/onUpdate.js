"use strict";

const eventSearch = require( '../eventSearch' );

let log = console.log;

module.exports = ( before, after, context ) => {

  log( 'updated event %s with context %s', after.uid, JSON.stringify( context ) );

  eventSearch.events.update( after, context );

}

module.exports.setLog = l => log = l;