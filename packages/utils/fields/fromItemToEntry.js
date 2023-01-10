'use strict';

const _ = require('lodash');

const {
  getName: getDatabaseFieldName,
  getPath: getDatabaseFieldPath,
} = require('./databaseField');

const extractDbRules = field => ({
  ...typeof field.db === 'object' ? field.db : {},
  field: getDatabaseFieldName(field),
  path: getDatabaseFieldPath(field),
});

const loadJSONValue = (JSONValue, path, value, assign = false) => {
  if (path.length) {
    return JSON.stringify(_.set(
      JSON.parse(JSONValue || '{}'),
      path,
      value,
    ));
  }

  if (!JSONValue) {
    return value !== null ? JSON.stringify(value) : null;
  }

  const parsedJSONValue = JSON.parse(JSONValue);

  if (Array.isArray(parsedJSONValue) || !assign) {
    return JSON.stringify(value);
  }

  if (value === null) {
    return null;
  }

  return JSON.stringify({
    ...JSON.parse(JSONValue),
    ...value,
  });
};

function getItemValue(field, data, currentValue) {
  const itemValue = [field].concat(field.linkedFields ?? []).reduce((acc, value) => {
    if (data[value.field] !== (undefined || null)) {
      return data[value.field];
    }
    return acc;
  }, undefined);

  if (itemValue === undefined) return currentValue;
  return itemValue;
}

function fromItemToDbEntry(fields, data, current) {
  const currentEntry = current && fromItemToDbEntry(fields, current);

  const dbEntry = fields.reduce((entry, field) => {
    if (data[field.field] === undefined) {
      return entry;
    }

    const {
      field: entryField,
      type: entryType,
      path: entryPath,
      assign: entryAssign,
      format: formatFunction,
    } = extractDbRules(field);

    if (entryType === 'json') {
      const preformatted = formatFunction ? formatFunction(data) : data[field.field];
      const value = loadJSONValue(
        entry[entryField] !== undefined ? entry[entryField] : currentEntry?.[entryField],
        entryPath,
        preformatted,
        entryAssign,
      );
      return {
        ...entry,
        [entryField]: value,
      };
    }

    const currentValue = currentEntry?.[entryField] !== undefined ? currentEntry[entryField] : undefined;
    const value = getItemValue(field, data, currentValue);
    return {
      ...entry,
      [entryField]: value,
    };
  }, {});

  return dbEntry;
}

module.exports = fromItemToDbEntry;

module.exports.loadWithLinkedFields = fields => {
  fields.forEach(field => {
    field.linkedFields = fields.filter(f => (f !== field) && (getDatabaseFieldName(f) === getDatabaseFieldName(field)));
  });
  return fromItemToDbEntry.bind(null, fields);
};
