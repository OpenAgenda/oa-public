import logger from '@openagenda/logs';
import Create from './lib/create.js';
import get from './lib/get.js';
import list from './lib/list.js';
import Update from './lib/update.js';

export default function Embeds(config = {}) {
  const internals = {
    knex: config.knex,
    interfaces: {
      getAgendaId: config.interfaces?.getAgendaId,
    },
    defaultTemplates: config.defaultTemplates,
  };

  return (agendaUid) => ({
    create: Create(internals, agendaUid),
    update: Update(internals, agendaUid),
    list: (...args) => list(internals, agendaUid, ...args),
    get: (...args) => get(internals, agendaUid, ...args),
  });
}

export function updateLoggerConfig(config) {
  logger.setModuleConfig(config);
}

Embeds.updateLoggerConfig = updateLoggerConfig;
