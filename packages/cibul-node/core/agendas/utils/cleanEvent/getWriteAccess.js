'use strict';

const {
  utils: {
    getRoleSlug,
  },
} = require('@openagenda/members');

module.exports = function getWriteAccess(member, access) {
  return member ? getRoleSlug(member.role) : access;
};
