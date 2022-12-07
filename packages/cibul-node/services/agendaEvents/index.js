'use strict';

const AgendaEvents = require('@openagenda/agenda-events');
const eventStates = require('@openagenda/agendas/service/validate/eventStates');

const loadAgendaEventMw = require('./middleware/load');

const interfaces = require('./interfaces');
const plugApp = require('./plugApp');

function init(config, services) {
  return AgendaEvents({
    mysql: config.db,
    knex: config.knex,
    redis: config.redis,
    redisClient: config.redisClient,
    logger: config.getLogConfig('svc', 'agendaEvents'),
    schemas: {
      agendaEvent: config.schemas.agendaEventService,
    },
    legacy: {
      schemas: {
        agendaEvent: config.schemas.agendaEvent,
        eventEditor: config.schemas.eventEditor,
        event: config.schemas.event,
        agenda: config.schemas.agenda,
        user: config.schemas.user,
      },
      interval: 1000,
    },
    eventStates,
    interfaces: interfaces({ config, services }),
  });
}

module.exports = Object.assign(plugApp, {
  init,
  mw: {
    // make the variants load and loadOrFail
    loadOrFail: loadAgendaEventMw,
  },
});
