'use strict';

const { promisify } = require('util');
const VError = require('verror');

module.exports = async (services, networkUid) => {
  const {
    networks
  } = services;

  if (!networkUid) return null;

  const network = await networks.get(networkUid);

  if (!network) {
    throw new VError('network of uid %d was not found', networkUid);
  }

  return network;
}
