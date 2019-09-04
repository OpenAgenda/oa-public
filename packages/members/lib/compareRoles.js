'use strict';

const _ = require('lodash');
const roles = require('../iso/roles');

const roleWeights = {
  ADMINISTRATOR: 100,
  MODERATOR: 50,
  CONTRIBUTOR: 10,
  READER: 1,
  NOROLE: 0
};

const rolePairs = _.toPairs(roles);

const isNumberLike = value => !Number.isNaN(Number(value)) && Number.isFinite(parseInt(value, 10));

function _getRoleStringCode(role) {
  if ([null, undefined].includes(role)) return 'NOROLE';

  const match = rolePairs.find(p => (isNumberLike(role)
    ? Number(role) === p[1]
    : String(role).toUpperCase() === p[0]));

  if (!match) throw new Error(`Unknown role: ${role}`);

  return match[0];
}

function isEqualTo(role, compareWithRole) {
  return _getRoleStringCode(role) === _getRoleStringCode(compareWithRole);
}

function isSuperiorTo(role, compareWithRole) {
  return (
    roleWeights[_getRoleStringCode(role)]
    > roleWeights[_getRoleStringCode(compareWithRole)]
  );
}

function isSuperiorToOrEqual(role, compareWithRole) {
  return (
    isSuperiorTo(role, compareWithRole) || isEqualTo(role, compareWithRole)
  );
}

function isLessThan(role, compareWithRole) {
  return (
    roleWeights[_getRoleStringCode(role)]
    < roleWeights[_getRoleStringCode(compareWithRole)]
  );
}

module.exports = {
  isSuperiorTo,
  isSuperiorToOrEqual,
  isEqualTo,
  isLessThan
};
