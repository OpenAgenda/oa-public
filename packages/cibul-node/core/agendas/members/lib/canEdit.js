'use strict';

const log = require('@openagenda/logs')('core/agendas/members/canEdit');

module.exports = ({ members }, {
  acting,
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

  if (role !== undefined) { // if role is unchanged, there is no issue.
    log('non admin user cannot assign role');
    return false;
  }

  if (actingRoleSlug === 'moderator') {
    return true;
  }

  if (parseInt(acting.userUid, 10) === parseInt(userUid, 10)) {
    return true;
  }

  return false;
};
