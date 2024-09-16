import AgendaEvents from '@openagenda/agenda-events';
import eventStates from '@openagenda/agendas/service/validate/eventStates.js';
import interfaces from './interfaces.js';
import plugApp from './plugApp.js';
import clearOldSoftRemoved from './clearOldSoftRemovedEvents.js';

export function init(config, services) {
  const { queues } = services;

  const queue = queues('agendaEvents');

  return Object.assign(
    AgendaEvents({
      mysql: config.db,
      knex: config.knex,
      queue,
      redisClient: services.redis,
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
    }),
    {
      plugApp,
      clearOldSoftRemoved: clearOldSoftRemoved.bind(null, services),
      task: () => queue.run(),
      shutdown: (options = {}) =>
        queue.stop({
          remove: true,
          clear: options.reset ?? false,
        }),
    },
  );
}
