'use strict';

const { encode, decode } = require('@openagenda/utils/base64');

module.exports.flatten = (obj, fields) => encode(JSON.stringify(fields
  .reduce((picked, field) => ({
    ...picked,
    [field]: obj[field]
  }), {}))
);

module.exports.inflate = obj => JSON.parse(decode(obj));
