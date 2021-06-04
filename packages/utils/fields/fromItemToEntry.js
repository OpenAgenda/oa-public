'use strict';

const _ = require('lodash');

const {
  getName: getDatabaseFieldName,
  getPath: getDatabaseFieldPath
} = require('./databaseField');

const preFormat = (data, hasLocationImage)  => {
  if (typeof data.image === 'string' && !hasLocationImage) {
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

const loadJSONValue = (JSONValue, path, value, assign = false) => {
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

  if (Array.isArray(parsedJSONValue) || !assign) {
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

function fromItemToDbEntry(fields, data, current) {
  // console.log('item', { data, current });
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
      format: formatFunction
    } = extractDbRules(field);

    if (entryType === 'json') {
      const preformatted = formatFunction ? formatFunction(data) : data[field.field]
      //console.log(preformatted, entryField)
      const value = loadJSONValue(
        entry[entryField] !== undefined ? entry[entryField]: currentEntry?.[entryField],
        entryPath,
        preformatted,
        entryAssign
      );
      return {
        ...entry,
        [entryField]: value
      };
    }

    const currentValue = currentEntry?.[entryField] !== undefined ? currentEntry[entryField] : undefined;
    const value = data[field.field] !== undefined ? data[field.field] : currentValue;
    return {
      ...entry,
      [entryField]: value
    };

  }, {});

   //console.log('entry', dbEntry);

  return dbEntry;
}

module.exports = fromItemToDbEntry;