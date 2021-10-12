'use strict';

const log = require('@openagenda/logs')('core/agendas/members/canEdit');

module.exports = ({ members }, {
  acting,
  actingUserUid,
  userUid,
  role
}) => {
  const {
    utils: {
      getRoleSlug
    }
  } = members;

  const actingRoleSlug = acting ? getRoleSlug(acting.role) : null;

  if (actingRoleSlug === 'administrator') {
    log('acting user is administrator, can edit');
    return true;
  }

  if (role !== undefined) {
    log('non admin user cannot assign role');
    return false;
  }

  if (actingRoleSlug === 'moderator') {
    return true;
  }

  if (actingUserUid === userUid) {
    return true;
  }

  return false;
};
