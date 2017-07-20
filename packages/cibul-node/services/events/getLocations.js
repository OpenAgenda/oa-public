"use strict";

const locations = require( 'agenda-locations' );

let log = console.log;

module.exports = ( uids, options, cb ) => locations.list( { uids }, 0, 50, options, cb );

module.exports.setLog = l => log = l;