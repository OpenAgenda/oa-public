"use strict";

let log = console.log;

module.exports = ( event, cb ) => {

  log( 'will remove event %s', event.uid );

  cb();

}

module.exports.setLog = l => log = l;