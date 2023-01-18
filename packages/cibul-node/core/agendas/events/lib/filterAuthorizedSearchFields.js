'use strict';

const _ = require('lodash');

module.exports = (core, query, access) => {
  const {
    compareRoles,
  } = core.services.members.utils;

  if (access === 'internal') {
    return query;
  }

  if (!compareRoles.isSuperiorToOrEqual(access, 'moderator')) {
    return _.omit(query, ['state']);
  }

  return query;
};
