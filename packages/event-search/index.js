'use strict';

const _ = require('lodash');
const elasticsearch = require('@elastic/elasticsearch');
const logger = require('@openagenda/logs');

const add = require('./add');
const Search = require('./search');

const moreLikeThis = require('./moreLikeThis');
const rebuild = require('./rebuild');
const remove = require('./remove');
const searchIncludes = require('./config/searchIncludes.json');
const update = require('./update');
const Cluster = require('./cluster');
const mapping = require('./config/mapping.json');
const updateMapping = require('./utils/updateMapping');
const geoJSON = require('./utils/geoJSON');

module.exports = c => {
  const config = {
    client: new elasticsearch.Client(_.pick(c.elasticsearch, ['node', 'log', 'ssl'])),
    type: 'event',
    baseSearchIncludes: searchIncludes.base,
    detailedSearchIncludes: searchIncludes.detailed,
    defaultIndex: 'main',
    assetsPath: null,
    ...c,
  };

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  return Object.assign(alias => {
    const search = Search(config, alias);

    return {
      name: alias,
      rebuild: rebuild.bind(null, config, alias),
      search,
      moreLikeThis: moreLikeThis.bind(null, search),
      add: add.bind(null, config, alias),
      update: update.bind(null, config, alias),
      remove: remove.bind(null, config, alias),
    };
  }, {
    getConfig: () => config,
    cluster: Cluster(config),
    updateMapping: updateMapping.bind(null, config, config.defaultIndex, mapping),
  });
};

module.exports.utils = {
  geoJSON,
};
