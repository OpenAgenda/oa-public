import AgendaEvents from '@openagenda/agenda-events';
import eventStates from '@openagenda/agendas/service/validate/eventStates.js';
import interfaces from './interfaces.js';
import plugApp from './plugApp.js';
import clearOldSoftRemoved from './clearOldSoftRemovedEvents.js';

export function init(config, services) {
  return Object.assign(
    AgendaEvents({
      knex: config.knex,
      redisClient: services.redis,
      logger: config.getLogConfig('svc', 'agendaEvents'),
      schemas: {
        agendaEvent: config.schemas.agendaEventService,
      },
      eventStates,
      interfaces: interfaces({ config, services }),
    }),
    {
      plugApp,
      clearOldSoftRemoved: clearOldSoftRemoved.bind(null, services),
    },
  );
}
