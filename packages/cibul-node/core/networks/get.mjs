import { NotFound } from '@openagenda/verror';

export default async (core, networkUid, options = {}) => {
  const { networks } = core.services;

  const {
    throwNotFound,
  } = {
    throwNotFound: false,
    ...options,
  };

  const network = await networks.get(networkUid);

  if (!network && throwNotFound) {
    throw new NotFound({ info: { uid: networkUid } }, 'network not found');
  }

  return network;
};
