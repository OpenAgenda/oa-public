'use strict';

const { promisify } = require('util');
const log = require('@openagenda/logs')('core/utils/refreshAgenda');
const agendas = require('@openagenda/agendas');

const setAgenda = promisify(agendas.set);

module.exports = async uid => {
  try {
    await setAgenda({ uid }, { updatedAt: new Date() }, { private: null });
  } catch (e) {
    log('error', 'failed to refresh agenda %s: %j', uid, e);
  }
};
