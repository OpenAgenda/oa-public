"use strict";

let log = console.log;

module.exports = ( before, after ) => {

  log( 'updated event %s', after.uid );

}

module.exports.setLog = l => log = l;