'use strict';

const _ = require('lodash');

const fields = require('.');

function flatten(flattened, field, accessType = 'read', defaultAccesses = []) {
  const flattenedField = {
    ..._.omit(field, ['fields']),
    [accessType]: (field[accessType] || defaultAccesses).concat([])
  };
  flattened.push(flattenedField);

  if (field.type === 'schema') {
    return field.fields
      .map(f => ({ ...f, field: [field.field, f.field].join('.') }))
      .reduce((flattened, f) => flatten(flattened, f, accessType, flattenedField[accessType]), flattened);
  } else {
    return flattened;
  }
}

function spreadByAccess(accessType, byAccess, field) {
  field[accessType].reduce(
    (accesses, accessItem) => accesses.includes(accessItem) ? accesses : accesses.concat(accessItem)
  , []).forEach(access => {
    byAccess[access] = (byAccess[access] || []).concat(field);
  });
  return byAccess;
};

function extractAccesses(accessType, defaultAccesses, field) {
  if (field[accessType]) {
    field[accessType].forEach(access => {
      if (!defaultAccesses.includes(access)) {
        defaultAccesses.push(access);
      }
    });
  }
  return defaultAccesses;
}

const flattened = {
  read: fields.reduce((fields, field) => flatten(fields, field, 'read'), []),
  write: fields.reduce((fields, field) => flatten(fields, field, 'write'), [])
};

const defaultAccesses = {
  read: flattened.read.reduce(extractAccesses.bind(null, 'read'), ['public']),
  write: flattened.write.reduce(extractAccesses.bind(null, 'write'), ['public'])
};

module.exports = ['read', 'write'].reduce((result, accessType) => ({
  ...result,
   [accessType]: flattened[accessType]
    .map(field => ({
      ...field,
      [accessType]: field[accessType].length ? field[accessType] : defaultAccesses[accessType]
    })).reduce(spreadByAccess.bind(null, accessType), [])
  }), {});
