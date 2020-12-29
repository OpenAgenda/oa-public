'use strict';

const _ = require('lodash');
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
}

const loadJSONValue = (JSONValue, path, value) => {
  if (!path.length) {
    return JSON.stringify({
      ...JSON.parse(JSONValue), 
      ...value
    });
  }

  return JSON.stringify(_.set(JSON.parse(JSONValue), path, value));
}

function fromItemToDbEntry(data, current) {
  
  const currentEntry = current && fromItemToDbEntry(current);

  const intermediate = preFormat(data);

  return fields.reduce((entry, field) => {
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
        entry[entryField] || currentEntry?.[entryField] || '{}',
        entryPath,
        intermediate[field.field]
      );
      
      return {
        ...entry,
        [entryField]: value
      };
    } else {
      const currentValue = currentEntry?.[entryField] !== undefined ? currentEntry[entryField] : undefined;
      const value = intermediate[field.field] !== undefined ? intermediate[field.field] : currentValue;
      return {
        ...entry,
        [entryField]: value
      }
    }

    return {
      ...entry,
      [entryField]: entry[field.field]
    };
  }, {});
}

module.exports = fromItemToDbEntry;