"use strict";

const _ = require('lodash');
const { promisify } = require('util');

const log = require('@openagenda/logs')('core/agendas/update');

const agendaSettings = require('./settings');

module.exports = async (core, agendaOrUid, data, options = {}) => {
  const setAgenda = promisify(core.services.agendas.set);

  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  log('updating agenda of uid %s', agendaUid);

  const {
    success,
    agenda,
    errors
  } = await setAgenda({ uid: agendaUid }, data, options);

  if (!success) throw new Error( 'could not update agenda' );

  if (options.updateLegacy) {
    log('updating legacy settings of agenda');
    await agendaSettings(core)(agenda).legacy.update( true );
  }

  return agenda;
}
