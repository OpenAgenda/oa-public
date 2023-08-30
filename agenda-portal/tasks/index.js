'use strict';

const cacheTask = require('./cache');

module.exports = ({ config, app }) => {
  cacheTask(app, config.cache);
};
