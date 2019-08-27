'use strict';

const logger = require('@openagenda/logs');
const get = require('./get');
const list = require('./list');
const stream = require('./stream');
const create = require('./create');
const patch = require('./patch');
const remove = require('./remove');
const setByEmail = require('./setByEmail');
const roles = require('./iso/roles');
const compareRoles = require('./lib/compareRoles');
const getRoleCode = require('./lib/getRoleCode');
const getRoleSlug = require('./lib/getRoleSlug');

const utils = {
  roles,
  compareRoles,
  getRoleCode,
  getRoleSlug
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
