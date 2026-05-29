import logs from '@openagenda/logs';
import agendaSearch from '@openagenda/agenda-search';
import listAgendas from './lib/listAgendas.js';
import refreshDueSweep from './lib/refreshDueSweep.js';
import plugApp from './plugApp.js';

const log = logs('services/agendaSearch');

export function init(config, services) {
  const useSSL = config?.es75?.ssl;
  const port = config?.es75?.port || 9200;
  const protocol = config?.es75?.protocol || (useSSL ? 'https' : 'http');
  const host = config?.es75?.host || 'localhost';

  const search = agendaSearch({
    alias: config.agendaSearchAlias,
    elasticsearch: {
      node: `${protocol}://${host}:${port}`,
      ssl: useSSL,
    },
    defaultImage: '//cdn.openagenda.com/static/graylogo140.png',
    logger: config.getLogConfig('svc', 'agendaSearch'),
    site: {
      url: config.root,
      image: config.logo,
    },
    listAgendas: listAgendas(services),
    getDetailedAgenda: (agenda) => {
      log('getting detailed info for agenda %s', agenda.slug);
      return services.core.agendas(agenda.uid).get({
        detailed: 1,
        access: 'internal',
        includeEvent: true,
      });
    },
  });

  return Object.assign(search, {
    plugApp: plugApp.bind(null, config, services, search),
    refreshDueSweep: refreshDueSweep(config, services),
  });
}
