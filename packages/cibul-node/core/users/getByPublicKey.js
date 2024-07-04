'use strict';

const log = require('@openagenda/logs')('core/users/getByPublicKey');

module.exports = async function getByPublicKey(core, publicKey) {
  const {
    services: { accessTokens, users },
  } = core;

  const user = await accessTokens.getUserFromKey(publicKey);

  log('user %s', user.uid);
  const lastYear = new Date(new Date().setFullYear(new Date().getFullYear() - 1));

  if (user.lastSignin < lastYear) {
    await users
      .refresh(user.uid, {
        lastSignin: true,
      })
      .catch(err => {
        log('error', 'could not refresh lastSignin for user %s', user.uid, err);
      });
  }

  return user;
};
