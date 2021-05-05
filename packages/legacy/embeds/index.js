'use strict';

const get = require('./lib/get');

module.exports = (config = {}) => {
  const internals = {
    knex: config.knex
  };

  return {
    get: get(internals)
  };
};
