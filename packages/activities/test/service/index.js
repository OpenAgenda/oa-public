'use strict';

// proxy function for service in a test env. Init does service init as well as fixture loading.

const Service = require('../../src');

module.exports = Service;

const defaultFiles = [
  'activity',
  'feed',
  'feed_activity',
  'feed_follow',
  'feed_notification',
];

function normalizeParams(config, files, options) {
  if (Array.isArray(files)) {
    return { files, options: options || { reset: true } };
  }
  if (files && typeof files === 'object') {
    return { files: defaultFiles, options: files };
  }
  return { files: defaultFiles, options: { reset: true } };
}

module.exports.initAndLoad = async (config, files, options) => {
  const { files: normalizedFiles, options: normalizedOptions } = normalizeParams(config, files, options);
  const params = { reset: true, ...normalizedOptions };

  const { database } = config.knex.client.config.connection;

  if (params.reset) {
    await config.knex.raw(`DROP DATABASE IF EXISTS ${database}`);
    await config.knex.raw(`CREATE DATABASE ${database}`);
    await config.knex.raw(`USE ${database}`);
  }

  const service = await Service(config);

  for (const file of normalizedFiles) {
    await config.knex.seed.run({
      directory: `${__dirname}/seeds`,
      specific: `${file}.js`,
    });
  }

  return service;
};
