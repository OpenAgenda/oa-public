'use strict';

module.exports = async (core, agendaUid, options) => {
  const {
    members
  } = core.services;
  
  const getRoleSlug = members.utils.getRoleSlug;

  if (options.access) {
    return options.access;
  }

  const member = options.userUid ? await members.get({
    agendaUid,
    userUid: options.userUid
  }) : null;

  if (member) {
    return getRoleSlug(member.role);
  }
    
  return 'public';
}