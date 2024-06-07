import getUserFromKey from './lib/getUserFromKey.mjs';
import getUser from './lib/getUser.mjs';
import loadTokenAndValidate from './lib/loadTokenAndValidate.mjs';
import generateTokenFromSecretKey from './lib/generateTokenFromSecretKey.mjs';

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
