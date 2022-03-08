'use strict';

const log = require('@openagenda/logs')('services/members/resetCache');

module.exports = async function clearCache(services, member) {
  const {
    simpleCache
  } = services;

  const expire = 60 * 30; // expires after 30mn

  try {
    await simpleCache.hash('members', `${member.agendaUid}.${member.userUid}`).reset(expire);
  } catch (e) {
    log('error', e, 'reset cache for member %s failed', `${member.agendaUid}.${member.userUid}`);
  }
};
