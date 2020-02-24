'use strict';

const textLog = require('./textLog');

module.exports = (formSchema, access = null, event) => {
  const fields = formSchema.fields
    .filter(f => !f.read || f.read.includes(access))
    .map(f => f.field);

  return fields.reduce((filtered, field) => {
    if (event[field] !== undefined) {
      filtered[field] = event[field];
    }
    return filtered;
  }, {});
}
