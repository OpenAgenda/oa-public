'use strict';

const logs = require('@openagenda/logs');

module.exports = core => {
  const log = logs('core/users/get');

  return (userUid, options = {}) => {
    log('getting user %s', userUid);
    const {
      users: usersSvc,
    } = core.services;

    const {
      detailed = false,
    } = options;

    return usersSvc.findOne({ query: { uid: userUid }, detailed });
  };
};
