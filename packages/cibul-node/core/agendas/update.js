'use strict';

const { promisify } = require('util');
const _ = require('lodash');

const { BadRequest } = require('@openagenda/verror');
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
    errors,
    agenda
  } = await setAgenda({ uid: agendaUid }, data, options);

  if (errors?.length) throw new BadRequest({ info: { errors } }, 'invalid data');

  if (!success) throw new Error('could not update agenda');

  try {
    await agendaSearch.set(agenda);
  } catch (e) {
    log('error', 'could not update search index for agenda %s', agenda.uid, e?.meta?.body?.error ?? e);
  }

  if (options.updateLegacy) {
    log('updating legacy settings of agenda');
    await agendaSettings(core)(agenda).legacy.update(true);
  }

  return agenda;
};
