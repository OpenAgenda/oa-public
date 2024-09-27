'use strict';

const internalFields = require('../databaseFieldMap')
  .filter((field) => typeof field !== 'string' && field.internal)
  .map((f) => f.obj);

module.exports = (agenda) =>
  Object.keys(agenda).reduce((stripped, field) => {
    if (internalFields.includes(field)) {
      return stripped;
    }
    return {
      ...stripped,
      [field]: agenda[field],
    };
  }, {});
