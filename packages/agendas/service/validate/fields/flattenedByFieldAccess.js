'use strict';

const fields = require('.');

function flatten(flattened, field, readDefaultAccesses = []) {
  if (field.type === 'schema') {
    return field.fields
      .map(f => ({ ...f, field: [field.field, f.field].join('.') }))
      .reduce((flattened, f) => flatten(flattened, f, field.read), flattened);
  } else {
    flattened.push({
      ...field,
      read: (field.read || readDefaultAccesses).concat([])
    });
    return flattened;
  }
}

function spreadByAccess(byAccess, field) {
  field.read.reduce(
    (accesses, accessItem) => accesses.includes(accessItem) ? accesses : accesses.concat(accessItem)
  , []).forEach(access => {
    byAccess[access] = (byAccess[access] || []).concat(field);
  });
  return byAccess;
};

function extractAccesses(defaultAccesses, field) {
  if (field.read) {
    field.read.forEach(access => {
      if (!defaultAccesses.includes(access)) {
        defaultAccesses.push(access);
      }
    });
  }
  return defaultAccesses;
}

const flattened = fields.reduce((fields, field) => flatten(fields, field), []);

const defaultReadAccesses = flattened.reduce(extractAccesses, ['public']);

module.exports = flattened
  .map(field => ({
    ...field,
    read: field.read.length ? field.read : defaultReadAccesses
  }))
  .reduce(spreadByAccess, []);
