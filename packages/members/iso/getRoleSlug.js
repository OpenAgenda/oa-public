'use strict';

const _ = require('lodash');

const roleValues = require('./roleValues');

module.exports = code => {
  const slug = _.first(
    roleValues.filter(v => v.code === code).map(v => v.slugs[0])
  );

  if (slug === undefined) {
    throw new Error('Unknown role');
  }

  return slug;
};
