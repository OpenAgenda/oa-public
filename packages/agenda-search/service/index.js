'use strict';

const _ = require('lodash');
const es = require('@elastic/elasticsearch');
const logger = require('@openagenda/logs');

const cleanIndexedAgenda = require('./lib/cleanIndexedAgenda');
const mw = require('./lib/middleware');
const resyncUpdated = require('./lib/resyncUpdated');
const rebuild = require('./lib/rebuild');
const list = require('./lib/list');
const set = require('./lib/set');

module.exports = (config = {}) => {
  const {
    alias,
    getDetailedAgenda,
    listAgendas,
    elasticsearch,
    defaultImage,
    site
  } = {
    alias: 'agendas',
    defaultImage: null,
    site: {
      url: 'https://openagenda.com',
      image: 'https://s3.eu-central-1.amazonaws.com/oastatic/openagenda-185.png'
    },
    ...config
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
    cleanIndexedAgenda: cleanIndexedAgenda({ defaultImage })
  };

  const service = {
    list: list.bind(null, utilities),
    rebuild: rebuild.bind(null, utilities),
    resyncUpdated: resyncUpdated.bind(null, utilities),
    set: set.bind(null ,utilities),
    remove: agenda => client.delete({
      index: alias,
      id: agenda.uid
    }),
    getElasticsearchClient: () => client,
    getConfig: () => ({
      site
    })
  };

  service.mw = mw(service);

  return Object.assign(service.list, service);
}
