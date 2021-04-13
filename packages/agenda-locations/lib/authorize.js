'use strict';

const UnauthorizedError = require('@openagenda/utils/errors/UnauthorizedError');

module.exports = async (service, action, identifier = null, options = {}) => {
  const settings = await service.getSettings(options);
  if (settings.access[action].authorized) {
    return;
  }
  throw new UnauthorizedError('location', identifier, `Unauthorized ${action}`);
};
