'use strict';

const _ = require('lodash');

const config = {
  knex: null, // required
  schema: 'network',
};

function init(c) {
  config.knex = c.knex;
}

module.exports = _.assign(config, { init });
