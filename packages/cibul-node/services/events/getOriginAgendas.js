"use strict";

const agendas = require( '@openagenda/agendas' );

module.exports = ( uids, options, cb ) => {

  agendas.list( { uid: uids }, options, cb );

}