"use strict";

const agendas = require( '@openagenda/agendas' );
const { promisify } = require( 'util' );

module.exports = promisify( agendas.set );
