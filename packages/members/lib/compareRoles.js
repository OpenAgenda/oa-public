'use strict';

const toRoleCode = require('../iso/toRoleCode');
const getRoleSlug = require('../iso/getRoleSlug');

const roleWeights = {
  ADMINISTRATOR: 100,
  MODERATOR: 50,
  CONTRIBUTOR: 10,
  READER: 1,
  NOROLE: 0
};

function _getRoleSlug(role) {
  if ([null, undefined].includes(role)) {
    return 'NOROLE';
  }

  return getRoleSlug(toRoleCode(role)).toUpperCase();
}

function isEqualTo(role, compareWithRole) {
  return _getRoleSlug(role) === _getRoleSlug(compareWithRole);
}

function isSuperiorTo(role, compareWithRole) {
  return (
    roleWeights[_getRoleSlug(role)] > roleWeights[_getRoleSlug(compareWithRole)]
  );
}

function isSuperiorToOrEqual(role, compareWithRole) {
  return (
    isSuperiorTo(role, compareWithRole) || isEqualTo(role, compareWithRole)
  );
}

function isLessThan(role, compareWithRole) {
  return (
    roleWeights[_getRoleSlug(role)] < roleWeights[_getRoleSlug(compareWithRole)]
  );
}

module.exports = {
  isSuperiorTo,
  isSuperiorToOrEqual,
  isEqualTo,
  isLessThan
};
