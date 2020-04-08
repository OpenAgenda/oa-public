'use strict';

const log = require('@openagenda/logs')('core/networks/addAgenda');
const BadRequestError = require('../utils/BadRequestError');

module.exports = async (core, networkUid, agendaUid) => {
  const network = await core.networks(networkUid).get({ throwNotFound: true });

  const agenda = await core.agendas(agendaUid).get({
    private: null,
    throwNotFound: true
  });

  if (agenda.networkUid === networkUid) {
    throw new BadRequestError('agenda is already in the network');
  } else if (agenda.networkUid) {
    throw new BadRequestError('agenda is already in a network');
  }

  return core.agendas(agenda).update({ networkUid }, {
    protected: false,
    updateLegacy: true
  });
}
