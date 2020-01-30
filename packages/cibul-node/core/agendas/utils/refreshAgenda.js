'use strict';

const log = require('@openagenda/logs')('core/utils/refreshAgenda');
const agendas = require('@openagenda/agendas');

const setAgenda = require('util').promisify(agendas.set);

module.exports = async uid => {
  try {
    await setAgenda({ uid }, { updatedAt: new Date() }, { private: null });
  } catch (e) {
    log('error', 'failed to refresh agenda %s: %j', uid, e);
  }
}
