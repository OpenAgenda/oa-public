'use strict';

const {
  Forbidden
} = require('@openagenda/verror');

module.exports = async (service, action, identifier = null, options = {}) => {
  const settings = await service.getSettings(options);
  if (settings.access[action].authorized) {
    return;
  }
  throw new Forbidden({ info: { identifier } }, `Unauthorized ${action}`);
};
