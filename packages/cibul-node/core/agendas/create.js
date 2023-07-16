'use strict';

const { BadRequest } = require('@openagenda/verror');
const log = require('@openagenda/logs')('core/agendas/create');

module.exports = async (core, data, options = {}) => {
  const {
    services: {
      agendas,
    },
    users,
  } = core;

  const {
    userUid,
  } = options;

  if (!userUid) {
    throw new BadRequest('userUid must be defined');
  }

  const user = await users.get(userUid);

  if (!user) {
    throw new BadRequest('provided userUid matches no account');
  }

  const {
    success,
    agenda,
    errors,
  } = await agendas.set({
    ...data,
    ownerId: user.id,
  });

  if (errors?.length) {
    throw new BadRequest({ info: { errors } }, 'invalid data');
  }

  if (!success) {
    throw new Error('could not create agenda');
  }

  if (options.updateLegacy) {
    await core.agendas(agenda.uid).settings.legacy.update(true);
  }

  return agenda;
};
