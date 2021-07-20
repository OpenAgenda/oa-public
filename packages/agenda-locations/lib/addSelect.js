'use strict';

const _ = require('lodash');
const getMatchingDatabaseField = require('@openagenda/utils/fields/databaseField').getName;

const fields = require('./fields');

module.exports = (k, access, options = {}) => {
  const filteredFields = fields
    .filter(f => {
      if (options.include && options.include.includes(f.field)) {
        return true;
      }
      if (!f.read.includes(access)) {
        return false;
      }
      if (options.includeFields && options.includeFields.length) {
        return options.includeFields.includes(f.field);
      }
      return true;
    });
  (options.first ? k.first : k.select).bind(k)(
    _.uniq(filteredFields.map(getMatchingDatabaseField))
  );
};

module.exports.getMatchingDatabaseField = getMatchingDatabaseField;
