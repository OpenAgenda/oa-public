"use strict";

const agendas = require( 'agendas' );

module.exports = ( uids, options, cb ) => {

  agendas.list( { uid: uids }, options, cb );

}