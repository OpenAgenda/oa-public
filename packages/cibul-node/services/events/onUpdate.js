'use strict';

const log = require('@openagenda/logs')('events/onUpdate');

const createActivity = require('./lib/createActivity');

module.exports = async (services, before, after, context) => {
  log('info', 'updated event %s', after.uid, { context });

  const {
    legacy: {
      controlData: controlDataSvc
    }
  } = services;

  if (after.draft) return;

  try {
    await createActivity(services, before, after, context);
  } catch (e) {
    log('error', 'failed to create activity', e);
  }

  try {
    await controlDataSvc.queue('batch', after);
  } catch (e) {
    log('error', 'failed batch update of control data', e);
  }
};
