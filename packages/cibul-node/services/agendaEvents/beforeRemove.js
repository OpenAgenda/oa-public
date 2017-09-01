"use strict";

let log = console.log;

module.exports = ( ae, context ) => {

  log( 'will remove agenda-event %s with context %s', JSON.stringify( ae ), JSON.stringify( context ) );

}

module.exports.setLog = l => log = l;