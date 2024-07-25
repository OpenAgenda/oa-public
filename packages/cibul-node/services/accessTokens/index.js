import getUserFromKey from './lib/getUserFromKey.js';
import getUser from './lib/getUser.js';
import loadTokenAndValidate from './lib/loadTokenAndValidate.js';
import generateTokenFromSecretKey from './lib/generateTokenFromSecretKey.js';

export function init(config, services) {
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
}
