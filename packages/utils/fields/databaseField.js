'use strict';

const _ = require('lodash');

const getPath = (field, options = {}) => {
  const {
    excludeField,
  } = {
    excludeField: true,
    ...typeof options === 'object' ? options : {},
  };

  let path;
  if (!field.db) {
    path = _.snakeCase(field.field);
  } else if (typeof field.db === 'string') {
    path = field.db;
  } else {
    path = field.db?.field || _.snakeCase(field.field);
  }
  if (!excludeField) {
    return path;
  }

  const parts = path.split('.');
  parts.shift();

  return parts.join('.');
};

module.exports.getPath = getPath;

module.exports.getName = field => getPath(field, { excludeField: false }).split('.').shift();
