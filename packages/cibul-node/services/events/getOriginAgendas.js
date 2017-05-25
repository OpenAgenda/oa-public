"use strict";

const agendas = require( 'agendas' );

let log = console.log;

module.exports = ( uids, cb ) => agendas.list( { uids }, cb );

module.exports.setLog = l => log = l;
