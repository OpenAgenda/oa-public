'use strict';

const log = require('@openagenda/logs')('core/agendas/members/canCreate');

module.exports = ({ members, agendas }, {
  agenda,
  acting,
  actingUserUid,
  userUid,
  role,
  access,
}) => {
  const {
    utils: {
      getRoleSlug,
      compareRoles: {
        isSuperiorTo,
        isLessThan,
      },
    },
  } = members;

  if (access === 'internal') {
    return true;
  }

  const actingRoleSlug = acting ? getRoleSlug(acting.role) : null;

  if (actingRoleSlug === 'administrator') {
    log('acting user is administrator, can create');
    return true;
  }

  if (actingRoleSlug === 'moderator' && isSuperiorTo(acting.role, role)) {
    log('acting user is moderator and is creating lesser role member, can create');
    return true;
  }

  if (agenda.settings.contribution.type !== agendas.contributionTypes.OPEN) {
    log('contribution type is not open, cannot create');
    return false;
  }

  if (userUid !== actingUserUid) {
    log('role is contributor or less and acting user is other than member being added. Cannot create');
    return false;
  }

  if (!isLessThan(role, 'moderator')) {
    log('created member is moderator or more, cannot create.');
    return false;
  }

  return true;
};
