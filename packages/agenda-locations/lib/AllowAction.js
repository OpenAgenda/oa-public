'use strict';

const UnauthorizedError = require('@openagenda/utils/errors/UnauthorizedError');

module.exports = async (service, action, identifier = null) => {
  const settings = await service.getSettings();
  if (settings.access[action].authorized) {
    return;
  }
  throw new UnauthorizedError('location', identifier, `Unauthorized ${action}`);
};
