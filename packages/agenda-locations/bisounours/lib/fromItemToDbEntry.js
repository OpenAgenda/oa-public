'use strict';

const _ = require('lodash');
const fields = require('./fields.json');

module.exports = (item) => {
  const { entry, store } = fields.reduce(({ entry, store }, field) => {
    const value = item[field.field];
    if (field.db === 'store') {
      store[field.field] = value;
    } else if (field.db) {
      entry[field.db] = value;
    } else if (value !== undefined) {
      entry[_.snakeCase(field.field)] = value;
    }
    return { entry, store };
  }, { entry: {}, store: {} });

  return {
    ...entry,
    store: JSON.stringify(store)
  }
}
