'use strict';

const getUserFromKey = require('./lib/getUserFromKey');
const getUser = require('./lib/getUser');
const loadTokenAndValidate = require('./lib/loadTokenAndValidate');
const generateTokenFromSecretKey = require('./lib/generateTokenFromSecretKey');

module.exports.init = (config, services) => {
  const {
    users,
    knex,
  } = services;

  return {
    isValid: loadTokenAndValidate.bind(null, knex),
    getUser: getUser.bind(null, knex, users),
    getUserFromKey: getUserFromKey.bind(null, services),
    generateToken: generateTokenFromSecretKey.bind(null, services),
  };
};
