'use strict';

const log = require('@openagenda/logs')('events/onUpdate');

module.exports = async (services, before, after, context) => {
  log('info', 'updated event %s', after.uid, { context });

  const {
    legacy: {
      controlData: controlDataSvc
    }
  } = services;

  if (after.draft) return;

  try {
    await controlDataSvc.queue('batch', after);
  } catch (e) {
    log('error', 'failed batch update of control data', e);
  }
};
