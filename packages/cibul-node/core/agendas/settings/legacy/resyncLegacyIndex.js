"use strict";

const { promisify } = require( 'util' );

const search = require( '../../../../services/elasticsearch' );

module.exports = agendaId => promisify( search.agendas( { id: agendaId } ).resync )();
