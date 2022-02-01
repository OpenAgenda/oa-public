'use strict';

module.exports = async (core, networkUid) => {
  const network = await core.networks(networkUid).get();

  if (!network) {
    throw new Error('no network was found');
  }

  return core.services.formSchemas.get(network.formSchemaId);
};
