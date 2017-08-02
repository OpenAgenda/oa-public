"use strict";

const agendas = require( 'agendas' );

let log = console.log;

module.exports = ( uids, options, cb ) => {

  agendas.list( { uids }, options, cb );

}

module.exports.setLog = l => log = l;
