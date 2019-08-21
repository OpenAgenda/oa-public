'use strict';

const _ = require('lodash');
const logger = require('@openagenda/logs');

const get = require('./get');
const list = require('./list');
const stream = require('./stream');
const create = require('./create');
const patch = require('./patch');
const remove = require('./remove');
const setByEmail = require('./setByEmail');

const utils = {
  roles: require('./lib/roles'),
  compareRoles: require('./lib/compareRoles'),
  getRoleCode: require('./lib/getRoleCode'),
  getRoleSlug: require('./lib/getRoleSlug')
};

module.exports = (options = {}) => {
  const config = {
    knex: null,
    schema: 'member',
    interfaces: {},
    bulkThreshold: 10,
    queues: null,
    ...options
  };

  if (config.logger) {
    logger.setModuleConfig(config.logger);
  }

  return {
    get: Object.assign(get.bind(null, config), {
      byEmail: get.byEmail.bind(null, config)
    }),
    list: list.bind(null, config),
    create: create.bind(null, config),
    patch: patch.bind(null, config),
    remove: remove.bind(null, config),
    stream: stream.bind(null, config),
    set: {
      byEmail: Object.assign(setByEmail.bind(null, config), {
        bulk: setByEmail.bulk.bind(null, config)
      })
    },
    task: setByEmail.task.bind(null, config),
    utils
  };
};

module.exports.utils = utils;
