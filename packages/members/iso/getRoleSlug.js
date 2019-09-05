'use strict';

const roleValues = require('./roleValues');

module.exports = code => {
  const role = roleValues.find(v => v.code === code);
  const slug = role && role.slugs && role.slugs[0];

  if (!slug) {
    throw new Error('Unknown role');
  }

  return slug;
};
