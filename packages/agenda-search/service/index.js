import es from '@elastic/elasticsearch';
import logger from '@openagenda/logs';
import cleanIndexedAgenda from './lib/cleanIndexedAgenda.js';
import mw from './lib/middleware.js';
import resyncUpdated from './lib/resyncUpdated.js';
import rebuild from './lib/rebuild.js';
import list from './lib/list.js';
import set from './lib/set.js';
import markRefreshNow from './lib/markRefreshNow.js';

export default (config = {}) => {
  const {
    alias,
    getDetailedAgenda,
    listAgendas,
    elasticsearch,
    defaultImage,
    site,
  } = {
    alias: 'agendas',
    defaultImage: null,
    site: {
      url: 'https://openagenda.com',
      image: 'https://cdn.openagenda.com/static/openagenda-185.png',
    },
    ...config,
  };

  if (!listAgendas) {
    throw new Error('listAgendas function is required');
  }
  if (!getDetailedAgenda) {
    throw new Error('getAgendaSummary function is required');
  }
  if (!elasticsearch) {
    throw new Error('elasticsearch config is required');
  }

  const client = new es.Client(elasticsearch);

  if (config.logger) {
    logger.setModuleConfig(config.logger);
  }

  const utilities = {
    timeout: elasticsearch.timeout,
    alias,
    client,
    listAgendas,
    getDetailedAgenda,
    cleanIndexedAgenda: cleanIndexedAgenda({ defaultImage }),
  };

  const service = {
    list: list.bind(null, utilities),
    rebuild: rebuild.bind(null, utilities),
    resyncUpdated: resyncUpdated.bind(null, utilities),
    set: set.bind(null, utilities),
    markRefreshNow: markRefreshNow.bind(null, utilities),
    remove: (agenda) =>
      client.delete({
        index: alias,
        id: agenda.uid,
      }),
    getElasticsearchClient: () => client,
    getConfig: () => ({
      site,
    }),
  };

  service.mw = mw(service);

  return Object.assign(service.list, service);
};
