'use strict';

const log = require('@openagenda/logs')('core/networks/removeAgenda');
const BadRequestError = require('../utils/BadRequestError');

module.exports = async (core, networkUid, agendaUid) => {
  const network = await core.networks(networkUid).get({
    throwNotFound: true
  });
  const agenda = await core.agendas(agendaUid).get({
    throwNotFound: true,
    access: 'internal'
  });

  if (agenda.networkUid !== networkUid) {
    throw new BadRequestError('agenda is not in network');
  }

  return core.agendas(agenda).update({
    networkUid: null
  }, {
    protected: false,
    updateLegacy: true
  });
}
