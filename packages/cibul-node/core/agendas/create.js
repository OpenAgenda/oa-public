'use strict';

const { promisify } = require('util');

module.exports = async (core, data, options = {}) => {
  const setAgenda = promisify(core.services.agendas.set);

  const {
    success,
    agenda,
  } = await setAgenda(data);

  if (!success) {
    throw new Error('could not create agenda');
  }

  if (options.updateLegacy) {
    await core.agendas(agenda.uid).settings.legacy.update(true);
  }

  return agenda;
};
