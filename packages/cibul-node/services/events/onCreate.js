"use strict";

let log = console.log;

module.exports = event => {

  log( 'created event %s', event.uid );

}

module.exports.setLog = l => log = l;