'use strict';

const {
  BadRequest
} = require('@openagenda/verror');

module.exports = async (core, networkUid, agendaUid) => {
  await core.networks(networkUid).get({
    throwNotFound: true
  });
  const agenda = await core.agendas(agendaUid).get({
    throwNotFound: true,
    access: 'internal'
  });

  if (agenda.networkUid !== networkUid) {
    throw new BadRequest('agenda is not in network');
  }

  return core.agendas(agenda).update({
    networkUid: null
  }, {
    protected: false,
    updateLegacy: true
  });
};
