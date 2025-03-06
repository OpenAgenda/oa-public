'use strict';

const _ = require('lodash');

module.exports = require('.')
  .find((f) => f.field === 'credentials')
  .fields.reduce(
    (credentials, field) => ({
      ...credentials,
      [field.field]: _.omit(field, 'field'),
    }),
    {},
  );
