'use strict';

// proxy function for service in a test env. Init does service init as well as fixture loading.

const Service = require('../../src/service');

module.exports = Service;

module.exports.initAndLoad = async function(config, files, options) {
  const defautFiles = [
    'activity',
    'feed',
    'feed_activity',
    'feed_follow',
    'feed_notification',
  ];

  if (arguments.length === 2 && Array.isArray(arguments[1])) {
    options = { reset: true };
  } else if (arguments.length === 2) {
    options = files;
    files = defautFiles;
  } else if (arguments.length === 1) {
    options = { reset: true };
    files = defautFiles;
  }

  const params = Object.assign({
    reset: true,
  }, options);

  const { database } = config.knex.client.config.connection;

  if (params.reset) {
    await config.knex.raw(`DROP DATABASE IF EXISTS ${database}`);
    await config.knex.raw(`CREATE DATABASE ${database}`);
    await config.knex.raw(`USE ${database}`);
  }

  const service = await Service(config);

  for (const file of files) {
    await config.knex.seed.run({
      directory: __dirname + '/seeds',
      specific: `${file}.js`,
    });
  }

  return service;
};
