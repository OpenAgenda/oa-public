'use strict';

const { promisify } = require('node:util');

module.exports = (services, agendaId) => promisify(services.elasticsearch.agendas({ id: agendaId }).resync)();
