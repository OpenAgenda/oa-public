'use strict';

const {
  BadRequest
} = require('@openagenda/verror');

module.exports = async (core, networkUid, agendaUid) => {
  await core.networks(networkUid).get({ throwNotFound: true });

  const agenda = await core.agendas(agendaUid).get({
    private: null,
    throwNotFound: true,
    access: 'internal'
  });

  if (agenda.networkUid === networkUid) {
    throw new BadRequest('agenda is already in the network');
  } else if (agenda.networkUid) {
    throw new BadRequest('agenda is already in a network');
  }

  return core.agendas(agenda).update({ networkUid }, {
    protected: false,
    updateLegacy: true
  });
};
