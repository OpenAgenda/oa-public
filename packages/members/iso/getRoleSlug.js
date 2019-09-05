'use strict';

const roleValues = require('./roleValues');
const toRoleCode = require('./toRoleCode');

module.exports = input => {
  const code = toRoleCode(input);
  const role = roleValues.find(v => v.code === code);
  const slug = role && role.slugs && role.slugs[0];

  if (!slug) {
    throw new Error('Unknown role');
  }

  return slug;
};
