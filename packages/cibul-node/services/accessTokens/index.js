'use strict';

const VError = require('verror');
const log = require('@openagenda/logs')('services/accessTokens');

const getUserFromKey = require('./lib/getUserFromKey');
const getUser = require('./lib/getUser');
const loadTokenAndValidate = require('./lib/loadTokenAndValidate');
const generateTokenFromSecretKey = require('./lib/generateTokenFromSecretKey');

module.exports.init = function(config, services) {
  const { users } = services;
  const knex = config.knex;

  return {
    isValid: loadTokenAndValidate.bind(null, knex),
    getUser: getUser.bind(null, knex, users),
    getUserFromKey: getUserFromKey.bind(null, knex, users),
    generateToken: generateTokenFromSecretKey.bind(null, knex)
  }
}
