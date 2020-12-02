'use strict';

const cacheTask = require('./cache');

module.exports = ({ config, proxy }) => {
  cacheTask(proxy, config.cache);
};
