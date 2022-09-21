'use strict';

const isAdminModAccess = options => {
  console.log('isActingMod', options);
  const { access, actingMember } = options;
  if (access) return ['administrator', 'moderator', 'internal'].includes(access);
  console.log([2, 3].includes(actingMember?.role));
  return [2, 3].includes(actingMember?.role);
};

module.exports = isAdminModAccess;
