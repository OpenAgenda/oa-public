'use strict';

const isAdminModAccess = async (membres, agendaUid, options) => {
  const { access, actingMember, userUid } = options;

  if (access) return ['administrator', 'moderator', 'internal'].includes(access);
  if (actingMember) return [2, 3].includes(actingMember?.role);
  if (!userUid) return false;
  const retrivedActingMember = await membres.get({ userUid, agendaUid });
  return [2, 3].includes(retrivedActingMember?.role);
};

module.exports = isAdminModAccess;
