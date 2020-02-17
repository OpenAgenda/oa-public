"use strict";

const log = require('@openagenda/logs')('core/networks/addAgenda');

module.exports = async (core, networkUid, agendaUid) => {
  const network = await core.networks(networkUid).get();

  if (!network) throw new Error('network not found');

  const agenda = await core.agendas(agendaUid).get({ private: null });

  if (!agenda) throw new Error('agenda not found');

  if (agenda.networkUid) throw new Error('agenda is already in a network');

  return core.agendas(agenda).update({ networkUid }, {
    protected: false,
    updateLegacy: true
  });
}
