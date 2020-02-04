'use strict';

const _ = require('lodash');
const elasticsearch = require('@elastic/elasticsearch');
const logger = require('@openagenda/logs');

const add = require('./add');
const Search = require('./search');

const deleteFloatingIndices = require('./service/deleteFloatingIndices')
const deleteIndex = require('./service/deleteIndex');
const moreLikeThis = require('./moreLikeThis');
const rebuild = require('./rebuild');
const remove = require('./remove');
const exists = require('./service/exists');
const searchIncludes = require('./service/index/searchIncludes.json');
const parsers = require('./parsers');
const update = require('./update');
const Cluster = require('./service/cluster');

module.exports = c => {
  const config = Object.assign({
    client: new elasticsearch.Client(_.pick(c.elasticsearch, ['node', 'log'])),
    type: 'event',
    baseSearchIncludes: searchIncludes.base,
    detailedSearchIncludes: searchIncludes.detailed,
    defaultIndex: 'main'
  }, c);

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  return Object.assign(alias => {
    const search = Search(config, alias);

    return {
      name: alias,
      exists: exists.bind(null, config, alias),
      rebuild: rebuild.bind(null, config, alias),
      deleteIndex: deleteIndex.bind(null, config, alias),
      search,
      moreLikeThis: moreLikeThis.bind(null, search),
      add: add.bind(null, config, alias),
      update: update.bind(null, config, alias),
      remove: remove.bind(null, config, alias)
    };
  }, {
    getConfig: () => config,
    deleteFloatingIndices: deleteFloatingIndices.bind(null, config),
    cluster: Cluster(config)
  });
}

module.exports.utils = {
  parsers
}
