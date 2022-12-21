'use strict';

const logs = require('@openagenda/logs');

const log = logs('core/users/generateToken');

module.exports = async function generateToken(core, identifier) {
  const {
    services: {
      accessTokens,
      users,
    },
  } = core;

  const {
    token,
    user,
  } = await accessTokens.generateToken(identifier, { loadUser: true });

  log('generated token for user %s', user.uid);

  await users.refresh(user.uid, {
    lastSignin: true,
  }).catch(err => {
    log('error', 'could not refresh lastSignin for user %s', identifier, err);
  });

  return token;
};
