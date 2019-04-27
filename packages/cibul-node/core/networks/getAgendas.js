"use strict";

const agendas = require( '@openagenda/agendas' );

module.exports = networkUid => agendas.list( { networkUid }, 0, 1000 ).then( r => r.agendas );
