'use strict';

const _ = require('lodash');
const es = require('@elastic/elasticsearch');
const logger = require('@openagenda/logs');

const mw = require('./lib/middleware');
const formatForIndex = require('./lib/formatForIndex');
const resyncUpdated = require('./lib/resyncUpdated');
const rebuild = require('./lib/rebuild');
const list = require('./lib/list');

let log, search, config;

module.exports = (config = {}) => {
  const {
    alias,
    listAgendas,
    defaultImage,
    imagePath,
    elasticsearch,
    site,
    logo
  } = {
    alias: 'agendas',
    site: {
      url: 'https://openagenda.com',
      image: 'https://s3.eu-central-1.amazonaws.com/oastatic/openagenda-185.png'
    },
    ...config
  };

  if (!listAgendas) {
    throw new Error('listAgendas function is required');
  }
  if (!elasticsearch) {
    throw new Error('elasticsearch config is required');
  }

  const client = new es.Client(elasticsearch);

  if (config.logger) {
    logger.setModuleConfig(config.logger);
  }

  const service = {
    list: list.bind(null, { alias, client }),
    rebuild: rebuild.bind(null, {
      timeout: elasticsearch.timeout,
      alias,
      client,
      listAgendas,
      formatForIndex: formatForIndex.bind(null, { imagePath, defaultImage })
    }),
    resyncUpdated: resyncUpdated.bind(null, {
      client,
      alias,
      listAgendas,
      formatForIndex: formatForIndex.bind(null, { imagePath, defaultImage })
    }),
    getElasticsearchClient: () => client,
    getConfig: () => ({
      site
    })
  };

  service.mw = mw(service);

  return Object.assign(service.list, service);
}
