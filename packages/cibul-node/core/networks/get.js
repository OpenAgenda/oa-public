'use strict';

const NotFoundError = require('../utils/NotFoundError');

module.exports = async (core, networkUid, options = {}) => {
  const {
    networks
  } = core.services;

  const {
    throwNotFound
  } = {
    throwNotFound: false,
    ...options
  };

  const network = await networks.get(networkUid);

  if (!network && throwNotFound) {
    throw new NotFoundError('networks', networkUid);
  }

  return network;
}
