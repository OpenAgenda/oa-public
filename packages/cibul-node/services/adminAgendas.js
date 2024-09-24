import { promisify } from 'node:util';
import adminAgendas from '@openagenda/admin-agendas';

export async function init(config, services) {
  const { agendas, members } = services;

  await promisify(adminAgendas.init)({
    services: {
      agendas,
      members,
    },
    interfaces: {
      getAgendaCredentialDetails: () => agendas.utils.credentials,
    },
    mysql: config.db,
    schemas: config.schemas,
    logger: config.getLogConfig('svc', 'admin-agendas', false),
  });
}
