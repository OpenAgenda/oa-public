'use strict';

const isAdminModAccess = options => {
  const { access, actingMember } = options;
  if (access) return ['administrator', 'moderator', 'internal'].includes(access);
  return [2, 3].includes(actingMember?.role);
};

module.exports = isAdminModAccess;
