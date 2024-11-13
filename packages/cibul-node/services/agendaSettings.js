import { promisify } from 'node:util';
import * as agendaSettings from '@openagenda/agenda-settings';
import agendas from '@openagenda/agendas';

export async function init(config) {
  await promisify(agendaSettings.init)({
    services: {
      agendas,
    },
    mysql: config.db,
    schemas: config.schemas,
    logger: config.getLogConfig('svc', 'agenda-settings', false),
  });
}
