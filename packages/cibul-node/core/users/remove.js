'use strict';

module.exports = (core, userUid) => async function remove() {
  const {
    users: usersSvc,
  } = core.services;

  await usersSvc.remove(userUid);
};
