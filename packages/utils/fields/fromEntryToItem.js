'use strict';

const _ = require('lodash');

const getFieldsByAccess = require('./getFieldsByAccess');
const {
  getName: getDatabaseFieldName,
  getPath: getDatabaseFieldPath,
} = require('./databaseField');

module.exports = (fields, entry = {}, options = {}) => {
  const {
    access,
    includeFields,
    omitUndefinedFields,
    nullifyUndefined,
  } = {
    access: 'public',
    includeFields: [],
    omitUndefinedFields: false,
    nullifyUndefined: false,
    ...options,
  };

  const compiledItem = getFieldsByAccess(fields, 'read', access)
    .filter(f => (includeFields.length ? includeFields.includes(f.field) : true))
    .reduce((item, field) => {
      const dbFieldName = getDatabaseFieldName(field);
      const raw = entry[dbFieldName];
      const dbPath = getDatabaseFieldPath(field);
      const value = raw && (field?.db?.type === 'json') ? JSON.parse(raw) : raw;

      if (dbPath.length) {
        item[field.field] = _.get(value, dbPath);
      } else {
        item[field.field] = value === null && field.default ? field.default : value;
      }

      return item;
    }, {});

  if (omitUndefinedFields) {
    return _.pickBy(compiledItem, v => v !== undefined);
  }
  if (nullifyUndefined) {
    return _.mapValues(compiledItem, v => (v === undefined ? null : v));
  }
  return compiledItem;
};
