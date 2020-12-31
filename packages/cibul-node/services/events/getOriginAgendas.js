"use strict";

const agendas = require( '@openagenda/agendas' );

module.exports = Object.assign((uids, options, cb) => {
  agendas.list({ uid: uids }, options, cb);
}, { callback: true });