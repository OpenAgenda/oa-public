'use strict';

const _ = require('lodash');
const Networks = require('@openagenda/networks');

module.exports.init = config => Networks({
  knex: config.knex,
  logger: config.getLogConfig('svc', 'networks'),
});
