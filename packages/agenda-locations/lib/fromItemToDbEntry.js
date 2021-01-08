'use strict';

const _ = require('lodash');
const fields = require('./fields.json');

const legacy = require('./legacy');

module.exports = (item, current = null) => {
  const entryAndStore = fields.reduce(
    ({ entry, store }, field) => {
      const value = item[field.field];
      if (field.db === 'store') {
        store[field.field] = value;
      } else if (field.db) {
        entry[field.db] = value;
      } else if (value !== undefined) {
        entry[_.snakeCase(field.field)] = value;
      }
      return { entry, store };
    },
    { entry: {}, store: {} }
  );

  const patched = legacy.patch(
    entryAndStore.entry,
    entryAndStore.store,
    current
  );

  return {
    ...patched.entry,
    store: JSON.stringify(patched.store),
  };
};
