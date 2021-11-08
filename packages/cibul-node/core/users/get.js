'use strict';

module.exports = core => (userUid, options = {}) => {
  const {
    users: usersSvc
  } = core.services;

  const {
    detailed = false
  } = options;

  return usersSvc.findOne({ query: { uid: userUid }, detailed });
};
