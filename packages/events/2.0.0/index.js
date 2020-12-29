'use strict';

const knex = require('knex');
const logger = require('@openagenda/logs');

const create = require('./create');
const get = require('./get');
const list = require('./list');
const remove = require('./remove');
const update = require('./update');
const imageVariants = require('./lib/imageVariants');

module.exports = (c, options = {}) => {
  const config = Object.keys(c).reduce((config, key) => (
    config[key] !== undefined && c[key] !== undefined ? {
    ...config,
    [key]: c[key]
  } : config), {
    imagePath: '//cdn.to.images/',
    Files: null,
    schema: 'event_2',
    interfaces: null
  });

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  };

  const service = {
    config,
    clients: {
      knex: c.knex || knex({
        client: 'mysql',
        connection: config.mysql
      })
    },
    imageTransformAndUpload: config.Files && config.Files({
      key: 'image',
      variants: imageVariants(config.Files)
    }),
    interfaces: config.interfaces
  };

  return {
    create: create.bind(null, service),
    get: get.bind(null, service),
    list: list.bind(null, service),
    patch: update.bind(null, { service, isPatch: true }),
    remove: remove.bind(null, service),
    update: update.bind(null, { service })
  }
}
