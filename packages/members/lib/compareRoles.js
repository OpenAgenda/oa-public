'use strict';

const _ = require('lodash');

const roleWeights = {
  ADMINISTRATOR: 100,
  MODERATOR: 50,
  CONTRIBUTOR: 10,
  READER: 1,
  NOROLE: 0
};

const rolePairs = _.toPairs(require('./roles'));

module.exports = {
  isSuperiorTo,
  isSuperiorToOrEqual,
  isEqualTo,
  isLessThan
};

function isEqualTo(role, compareWithRole) {
  return _getRoleStringCode(role) === _getRoleStringCode(compareWithRole);
}

function isSuperiorToOrEqual(role, compareWithRole) {
  return (
    isSuperiorTo(role, compareWithRole) || isEqualTo(role, compareWithRole)
  );
}

function isSuperiorTo(role, compareWithRole) {
  return (
    roleWeights[ _getRoleStringCode(role) ]
    > roleWeights[ _getRoleStringCode(compareWithRole) ]
  );
}

function isLessThan(role, compareWithRole) {
  return (
    roleWeights[ _getRoleStringCode(role) ]
    < roleWeights[ _getRoleStringCode(compareWithRole) ]
  );
}

function _getRoleStringCode(role) {
  return typeof role === 'string'
    ? _getRoleStringCodeFromString(role)
    : _getRoleStringCodeFromInteger(role);
}

function _getRoleStringCodeFromString(role) {
  if ([null, undefined].includes(role)) return 'NOROLE';

  const matches = rolePairs.filter(p => role.toUpperCase() === p[ 0 ]);

  if (!matches.length) throw new Error(`Unknown role: ${role}`);

  return _.first(matches)[ 0 ];
}

function _getRoleStringCodeFromInteger(role) {
  if ([null, undefined].includes(role)) return 'NOROLE';

  const matches = rolePairs.filter(p => role === p[ 1 ]);

  if (!matches.length) throw new Error(`Unknown role: ${role}`);

  return _.first(matches)[ 0 ];
}
