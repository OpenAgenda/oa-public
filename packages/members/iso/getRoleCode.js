'use strict';

const roleValues = require('./roleValues');

module.exports = value => {
  const role = roleValues.find(v => value === v.key || v.slugs.includes(value));
  const code = role && role.code;

  if (code === undefined) {
    throw new Error('Unknown role');
  }

  return role.code;
};
