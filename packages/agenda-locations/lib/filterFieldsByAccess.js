'use strict';

const fields = require('./fields.json');

module.exports = (location, access = 'public') => fields
  .filter(field => field.read.includes(access))
  .reduce(
    (filtered, field) => ({
      ...filtered,
      [field.field]: location[field.field],
    }),
    {}
  );
