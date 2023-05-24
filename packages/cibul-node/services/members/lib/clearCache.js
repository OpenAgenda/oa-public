'use strict';

const log = require('@openagenda/logs')('services/members/clearCache');

module.exports = async function clearCache(services, member) {
  const { simpleCache } = services;

  try {
    await simpleCache.hash('members', `${member.agendaUid}.${member.userUid}`).del();
    log('clear member cache');
  } catch (e) {
    log('error', 'failed to clear member cache', { member, exception: e });
  }
};
