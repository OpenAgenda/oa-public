'use strict';

module.exports = (isAdmin, member) => {
  if (isAdmin) return member;

  if (!member || (!isAdmin && !member.organization)) return null;

  return { organization: member.organization };
};
