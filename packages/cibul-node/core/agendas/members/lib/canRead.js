'use strict';

const log = require('@openagenda/logs')('core/agendas/members/canRead');

module.exports = ({ members }, {
  access,
  actingMember,
  actingUserUid,
  userUid,
  list,
}) => {
  if (access === 'internal') {
    return true;
  }

  const {
    utils: {
      getRoleSlug,
    },
  } = members;

  const actingRoleSlug = actingMember ? getRoleSlug(actingMember.role) : null;

  if (['administrator', 'moderator'].includes(actingRoleSlug)) {
    log('acting user is adminmod, can read');
    return true;
  }

  if (list) {
    log('non adminmod user cannot list agenda members');
    return false;
  }

  return parseInt(userUid, 10) === parseInt(actingUserUid, 10);
};
