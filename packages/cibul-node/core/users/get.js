'use strict';

const log = require('@openagenda/logs')('core/users/get');

module.exports = core => {
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
