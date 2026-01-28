import _ from 'lodash';
import fields from './index.js';

function flatten(flattened, field, accessType = 'read', defaultAccesses = []) {
  const flattenedField = {
    ..._.omit(field, ['fields']),
    [accessType]: (field[accessType] || defaultAccesses).concat([]),
  };
  flattened.push(flattenedField);

  if (field.type === 'schema') {
    return field.fields
      .map((f) => ({ ...f, field: [field.field, f.field].join('.') }))
      .reduce(
        (accu, f) => flatten(accu, f, accessType, flattenedField[accessType]),
        flattened,
      );
  }
  return flattened;
}

function spreadByAccess(accessType, byAccess, field) {
  field[accessType]
    .reduce(
      (accesses, accessItem) =>
        (accesses.includes(accessItem) ? accesses : accesses.concat(accessItem)),
      [],
    )
    .forEach((access) => {
      byAccess[access] = (byAccess[access] || []).concat(field);
    });
  return byAccess;
}

function extractAccesses(accessType, defaultAccesses, field) {
  if (field[accessType]) {
    field[accessType].forEach((access) => {
      if (!defaultAccesses.includes(access)) {
        defaultAccesses.push(access);
      }
    });
  }
  return defaultAccesses;
}

const flattened = {
  read: fields.reduce((accu, field) => flatten(accu, field, 'read'), []),
  write: fields.reduce((accu, field) => flatten(accu, field, 'write'), []),
};

const defaultAccesses = {
  read: flattened.read.reduce(extractAccesses.bind(null, 'read'), ['public']),
  write: flattened.write.reduce(extractAccesses.bind(null, 'write'), [
    'public',
  ]),
};

export default ['read', 'write'].reduce(
  (result, accessType) => ({
    ...result,
    [accessType]: flattened[accessType]
      .map((field) => ({
        ...field,
        [accessType]: field[accessType].length
          ? field[accessType]
          : defaultAccesses[accessType],
      }))
      .reduce(spreadByAccess.bind(null, accessType), []),
  }),
  {},
);
