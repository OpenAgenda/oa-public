import * as agendaSettings from '@openagenda/agenda-settings';
import agendas from '@openagenda/agendas';

export async function init(config) {
  await agendaSettings.init({
    services: {
      agendas,
    },
    logger: config.getLogConfig('svc', 'agenda-settings', false),
  });
}
