'use strict';

const { promisify } = require('util');
const _ = require('lodash');
const removeAgenda = promisify(require('@openagenda/agendas').remove);

module.exports = async agendaOrUid => {
  const agendaUid = _.isObject(agendaOrUid) ? agendaOrUid.uid : agendaOrUid;

  const { success } = await removeAgenda({ uid: agendaUid });

  if (!success) throw new Error('could not remove agenda');
};
