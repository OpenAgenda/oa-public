'use strict';

const log = require('@openagenda/logs')('services/users/resetCache');

module.exports = async function resetCache(services, user) {
  const {
    simpleCache
  } = services;

  log('resetting');
  simpleCache('users', `api_key:${user.apiKey}`).del();
  simpleCache('users', `api_secret:${user.apiSecret}`).del();
};
