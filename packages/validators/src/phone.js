'use strict';

const rgx = require('./regex');

module.exports = config => rgx({
  optional: config ? config.optional : false,
  field: config ? config.field : undefined,
  default: config && 'default' in config ? config.default : null,
  regex: /^(\+|)([\d\s\.\-]|\([\d\s]\))+$/,
  error: {
    code: 'phone.invalid',
    message: 'value is not a phone number'
  },
  type: 'phone'
});
