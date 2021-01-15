'use strict';

const _ = require('lodash');

const log = require('@openagenda/logs')('fromDBEntryToItem');

const getFieldsByAccess = require('./getFieldsByAccess');
const {
  getName: getDatabaseFieldName,
  getPath: getDatabaseFieldPath
} = require('./databaseField');

module.exports = (service, entry = {}, options = {}) => {
  log('entry %j', entry);

  const {
    access,
    includeFields
  } = {
    access: 'public',
    includeFields: [],
    ...options
  };

  const compiledItem = getFieldsByAccess('read', access)
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

  log('item %j', compiledItem);

  return compiledItem;
};
