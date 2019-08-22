'use strict';

const _ = require('lodash');

const log = require('../lib/Log')('tasks/cache');

module.exports = (proxy, config) => {
  const { refreshInterval } = _.assign(
    {
      refreshInterval: 60 * 60 * 1000
    },
    config
  );

  log('cache will be refreshed every %s seconds', refreshInterval / 1000);

  setInterval(() => {
    proxy.clearCache();
  }, refreshInterval);
};
