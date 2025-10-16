import _ from 'lodash';

export default (core, query, access, actingMemberUid) => {
  const { compareRoles } = core.services.members.utils;

  if (access === 'internal') {
    return query;
  }
  if (compareRoles.isSuperiorToOrEqual(access, 'moderator')) {
    return query;
  }
  if (actingMemberUid && parseInt(query?.memberUid, 10) === actingMemberUid) {
    return query;
  }

  return _.omit(query, ['state']);
};
