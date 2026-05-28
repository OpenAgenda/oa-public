import getUser from './lib/getUser.js';
import loadTokenAndValidate from './lib/loadTokenAndValidate.js';
import generateTokenFromSecretKey from './lib/generateTokenFromSecretKey.js';
import clearOldTokens from './lib/clearOldTokens.js';

export function init(config, services) {
  const { users, knex } = services;

  return {
    isValid: loadTokenAndValidate.bind(null, knex),
    getUser: getUser.bind(null, knex, users),
    generateToken: generateTokenFromSecretKey.bind(null, services),
    clearOldTokens: clearOldTokens.bind(null, knex),
  };
}
