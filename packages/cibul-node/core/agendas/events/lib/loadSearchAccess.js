'use strict';

const log = require('@openagenda/logs')('core/agendas/events/loadSearchAccess');

module.exports = async (core, agendaUid, options) => {
  const {
    members
  } = core.services;
  
  const getRoleSlug = members.utils.getRoleSlug;

  if (options.access) {
    log('using provided access: %s', options.access);
    return options.access;
  }

  const member = options.userUid ? await members.get({
    agendaUid,
    userUid: options.userUid
  }) : null;

  if (member) {
    const role = getRoleSlug(member.role);
    log('member is loaded, using role as access', role);
    return role;
  }
    
  return 'public';
}