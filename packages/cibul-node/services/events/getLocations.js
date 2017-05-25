"use strict";

const locations = require( 'agenda-locations' );

let log = console.log;

module.exports = ( uids, cb ) => locations.list( { uids }, 0, 50, cb );

module.exports.setLog = l => log = l;
