"use strict";

const agendas = require( '@openagenda/agendas' );

let log = console.log;

module.exports = ( agendaId, cb ) => {
  cb(null, []);
}

module.exports.setLog = l => log = l;
