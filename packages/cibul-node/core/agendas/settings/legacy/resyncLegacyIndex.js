'use strict';

const { promisify } = require( 'util' );

module.exports = (services, agendaId) => promisify(services.elasticsearch.agendas({ id: agendaId }).resync)();
