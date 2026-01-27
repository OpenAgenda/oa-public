import * as agendaSettings from '@openagenda/agenda-settings';

export async function init(config, services) {
  const { agendas } = services;

  await agendaSettings.init({
    services: {
      agendas,
    },
    logger: config.getLogConfig('svc', 'agenda-settings', false),
  });
}
