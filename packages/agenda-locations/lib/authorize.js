import { Forbidden } from '@openagenda/verror';

export default async (service, action, identifier = null, options = {}) => {
  const settings = await service.getSettings(options);
  if (settings.access[action].authorized) {
    return;
  }
  throw new Forbidden({ info: { identifier } }, `Unauthorized ${action}`);
};
