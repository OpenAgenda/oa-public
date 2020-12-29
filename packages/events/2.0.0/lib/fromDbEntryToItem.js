'use strict';

const _ = require('lodash');
const getFieldsByAccess = require('./getFieldsByAccess');
const {
  getName: getDatabaseFieldName,
  getPath: getDatabaseFieldPath
} = require('./databaseField');

module.exports = (entry = {}, options = {}) => {
  const {
    access,
    includeFields
  } = {
    access: 'public',
    includeFields: [],
    ...options
  };

  return getFieldsByAccess('read', access)
    .filter(f => includeFields.length ? includeFields.includes(f.field) : true)
    .reduce((item, field) => {
      const dbFieldName = getDatabaseFieldName(field);
      const raw = entry[dbFieldName];
      const dbPath = getDatabaseFieldPath(field);
      const value = raw && (field?.db?.type === 'json') ? JSON.parse(raw) : raw;

      return {
        ...item,
        [field.field]: dbPath.length ? _.get(value, dbPath) : value
      }
    }, {});
}
