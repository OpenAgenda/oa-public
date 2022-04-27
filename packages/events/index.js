'use strict';

const knex = require('knex');
const logger = require('@openagenda/logs');

const create = require('./create');
const get = require('./get');
const list = require('./list');
const remove = require('./remove');
const update = require('./update');
const countByLocationUids = require('./countByLocationUids');
const setFromLegacy = require('./lib/legacy/from');
const imageVariants = require('./lib/imageVariants');

const utils = require('./utils');
const fromItemToEntry = require('@openagenda/utils/fields/fromItemToEntry');
const fromEntryToItem = require('@openagenda/utils/fields/fromEntryToItem');
const getFieldsByAccess = require('@openagenda/utils/fields/getFieldsByAccess');
const fields = require('./lib/fields');

module.exports = c => {
  const config = Object.keys(c).reduce((carriedConfig, key) => (
    carriedConfig[key] !== undefined && c[key] !== undefined ? {
      ...carriedConfig,
      [key]: c[key]
    } : carriedConfig), {
    imagePath: '',
    defaultImage: null,
    Files: null,
    schema: 'event_2',
    maxImageSize: 20971520, // 20MB
    interfaces: null
  });

  if (c.logger) {
    logger.setModuleConfig(c.logger);
  }

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
    interfaces: config.interfaces,
    fieldUtils: {
      fromItemToEntry: fromItemToEntry.bind(null, fields),
      fromEntryToItem: fromEntryToItem.bind(null, fields),
      getFieldsByAccess: getFieldsByAccess.bind(null, fields),
    }
  };

  const endpoints = {
    create: create.bind(null, service),
    get: get.bind(null, service),
    list: list.bind(null, service),
    countByLocationUids: countByLocationUids.bind(null, service),
    patch: update.bind(null, { service, isPatch: true }),
    remove: remove.bind(null, service),
    update: update.bind(null, { service }),
    middleware: {
      imageTransformAndUpload: service.imageTransformAndUpload?.middleware
    },
    utils
  };

  endpoints.setFromLegacy = setFromLegacy.bind(null, { service, endpoints });

  return endpoints;
};

module.exports.utils = utils;
