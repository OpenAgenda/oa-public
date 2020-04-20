'use strict';

const _ = require('lodash');

module.exports = require('.')
  .filter(f => f.field === 'credentials')
  .pop().fields
  .reduce((credentials, field) => ({
    ...credentials,
    [field.field]: _.omit(field, 'field')
  }), {});
