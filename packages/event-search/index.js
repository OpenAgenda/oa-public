'use strict';

const _ = require('lodash');
const elasticsearch = require('@elastic/elasticsearch');
const logger = require('@openagenda/logs');

const add = require('./service/add');
const deleteFloatingIndices = require('./service/deleteFloatingIndices')
const deleteIndex = require('./service/deleteIndex');
const moreLikeThis = require('./service/moreLikeThis');
const rebuild = require('./service/rebuild');
const remove = require('./service/remove');
const search = require('./service/search');
const searchIncludes = require('./service/index/searchIncludes.json');
const parsers = require('./parsers');
const update = require('./service/update');

module.exports = c => {
  const config = Object.assign({
    client: new elasticsearch.Client(_.pick(c.elasticsearch, ['node', 'log'])),
    type: 'event',
    baseSearchIncludes: searchIncludes.base,
    detailedSearchIncludes: searchIncludes.detailed
  }, c);

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

  return Object.assign(alias => ({
    name: alias,
    exists: () => config.client.indices.existsAlias({ name: alias }).then(r => r.body),
    rebuild: rebuild.bind(null, config, alias),
    deleteIndex: deleteIndex.bind(null, config, alias),
    search: search(config, alias),
    moreLikeThis: moreLikeThis.bind(null, config, alias),
    add: add.bind(null, config, alias),
    update: update.bind(null, config, alias),
    remove: remove.bind(null, config, alias)
  }), {
    getConfig: () => config,
    deleteFloatingIndices: deleteFloatingIndices.bind(null, config)
  })
}

module.exports.utils = {
  parsers
}
