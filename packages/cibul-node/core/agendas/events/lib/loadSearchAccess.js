'use strict';

const log = require('@openagenda/logs')('core/agendas/events/loadSearchAccess');

module.exports = async (core, agendaUid, options = {}) => {
  const {
    members,
    simpleCache,
  } = core.services;

  const {
    getRoleSlug,
  } = members.utils;

  if (options.access) {
    log('using provided access: %s', options.access);
    return options.access;
  }

  if (!options.userUid) {
    return null;
  }

  const cached = await simpleCache.hash('members', `${agendaUid}.${options.userUid}`).get('role');

  if (cached) {
    return cached;
  }

  const member = options.userUid ? await members.get({
    agendaUid,
    userUid: options.userUid,
  }) : null;

  let role = 'public';

  if (member) {
    role = getRoleSlug(member.role);
    log('member is loaded, using role as access', role);
  }

  simpleCache.hash('members', `${agendaUid}.${options.userUid}`).set('role', role);

  return role;
};
