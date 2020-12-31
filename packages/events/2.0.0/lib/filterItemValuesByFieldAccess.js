'use strict';

const fields = require('./fields');

module.exports = (item, access = 'public') => fields
  .filter(field => (field.read || []).includes(access))
  .reduce((filtered, field) => ({
  ...filtered,
  [field.field]: item[field.field]
}), {});
