'use strict';

const { promisify } = require('util');
const _ = require('lodash');

const log = require('@openagenda/logs')('core/agendas/update');

const agendaSettings = require('./settings');

module.exports = async (core, agendaOrUid, data, options = {}) => {
  const {
    agendas,
    agendaSearch
  } = core.services;

  const setAgenda = promisify(agendas.set);

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  log('updating agenda of uid %s', agendaUid);

  const {
    success,
    agenda
  } = await setAgenda({ uid: agendaUid }, data, options);

  if (!success) throw new Error('could not update agenda');

  try {
    await agendaSearch.set(agenda);
  } catch (e) {
    log('error', 'could not update search index for agenda %s', agenda.uid, e);
  }

  if (options.updateLegacy) {
    log('updating legacy settings of agenda');
    await agendaSettings(core)(agenda).legacy.update(true);
  }

  return agenda;
};
