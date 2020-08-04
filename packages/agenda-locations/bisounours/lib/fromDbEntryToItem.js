'use strict';

const _ = require('lodash');
const fields = require('./fields.json');

module.exports = (entry = {}, options = {}) => {
  const store = entry.store ? JSON.parse(entry.store) : {};
  const access = options.access || 'public';

  return fields.filter(f => f.read.includes(access)).reduce((obj, field) => {
    if (field.field === 'image') {
      obj[field.field] = store.image ? (options.imagePath || '') + store.image : null;
    } else if (field.db === 'store') {
      obj[field.field] = store[field.field];
    } else if (field.db) {
      obj[field.field] = entry[field.db];
    } else {
      obj[field.field] = entry[_.snakeCase(field.field)];
    }
    if (obj[field.field] === undefined) {
      obj[field.field] = null;
    }
    return obj;
  }, {});
}
