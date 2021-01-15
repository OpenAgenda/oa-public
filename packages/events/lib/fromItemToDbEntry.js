'use strict';

const _ = require('lodash');

const log = require('@openagenda/logs')('fromItemToDbEntry');

const fields = require('./fields');
const {
  getName: getDatabaseFieldName,
  getPath: getDatabaseFieldPath
} = require('./databaseField');

const preFormat = data => {
  if (typeof data.image === 'string') {
    return {
      ...data,
      image: { filename: data.image }
    }
  }
  return data;
}

const extractDbRules = field => {
  return {
    ...(typeof field.db === 'object' ? field.db : {}),
    field: getDatabaseFieldName(field),
    path: getDatabaseFieldPath(field)
  };
};

const loadJSONValue = (JSONValue, path, value) => {
  if (path.length) {
    return JSON.stringify(_.set(
      JSON.parse(JSONValue || '{}'),
      path,
      value
    ));
  }

  if (!JSONValue) {
    return value !== null ? JSON.stringify(value) : null;
  }

  const parsedJSONValue = JSON.parse(JSONValue);

  if (Array.isArray(parsedJSONValue)) {
    return JSON.stringify(value);
  }

  if (value === null) {
    return null;
  }

  return JSON.stringify({
    ...JSON.parse(JSONValue),
    ...value
  });
};

function fromItemToDbEntry(data, current) {
  log('item', { data, current });
  const currentEntry = current && fromItemToDbEntry(current);

  const intermediate = preFormat(data);

  const dbEntry = fields.reduce((entry, field) => {
    if (intermediate[field.field] === undefined) {
      return entry;
    }

    const {
      field: entryField,
      type: entryType,
      path: entryPath
    } = extractDbRules(field);

    if (entryType === 'json') {
      const value = loadJSONValue(
        entry[entryField] !== undefined ? entry[entryField]: currentEntry?.[entryField],
        entryPath,
        intermediate[field.field]
      );
      return {
        ...entry,
        [entryField]: value
      };
    }

    const currentValue = currentEntry?.[entryField] !== undefined ? currentEntry[entryField] : undefined;
    const value = intermediate[field.field] !== undefined ? intermediate[field.field] : currentValue;
    return {
      ...entry,
      [entryField]: value
    };

  }, {});

  log('entry', dbEntry);

  return dbEntry;
}

module.exports = fromItemToDbEntry;
