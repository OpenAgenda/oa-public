'use strict';

const log = require('@openagenda/logs')('services/agendas/resetCache');

module.exports = async function clearCache(services, agenda) {
  const {
    simpleCache,
  } = services;

  log('resetting cache for agenda %s', agenda.slug);

  const expire = 60 * 30; // expires after 30mn

  try {
    await simpleCache.hash('agendas', agenda.uid).reset(expire);
    await simpleCache.hash('agendas', agenda.slug).reset(expire);
    await simpleCache.hash('core.agendas.get', agenda.uid).reset(expire);
  } catch (e) {
    log('error', e, 'reset cache for agenda %s failed', agenda.slug);
  }
};
