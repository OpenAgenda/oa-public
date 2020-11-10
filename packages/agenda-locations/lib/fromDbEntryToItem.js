'use strict';

const _ = require('lodash');
const fields = require('./fields.json');
const legacy = require('./legacy');

module.exports = (entry = {}, options = {}) => {
  const store = entry.store ? JSON.parse(entry.store) : {};

  const {
    access,
    omitUndefinedFields
  } = {
    access: 'public',
    omitUndefinedFields: false,
    ...options
  };

  return fields.filter(f => {
    if (!f.read.includes(access)) {
      return false;
    }
    if (options.includeFields && options.includeFields.length && !options.includeFields.includes(f.field)) {
      return false;
    }
    return true;
  }).reduce((obj, field) => {
    let value;
    if (field.field === 'image') {
      value = store.image ? (options.imagePath || '') + store.image : null;
    } else if (field.db === 'store') {
      value = store[field.field];
    } else if (field.db) {
      value = entry[field.db];
    } else {
      value = entry[_.snakeCase(field.field)];
    }
    const isUndefined =  value === undefined;

    if (isUndefined && !omitUndefinedFields) {
      obj[field.field] = null;
    } else if (!isUndefined) {
      obj[field.field] = value;
    }

    return legacy.load(obj, entry, store, options);
  }, {});
}
