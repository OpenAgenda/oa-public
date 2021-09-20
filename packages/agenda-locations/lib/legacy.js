'use strict';

const { produce } = require('immer');

module.exports.patch = produce((entry, currentItem, currentEntry) => {
  const entryHasExtId = Object.keys(entry).includes('ext_id');
  const extId = entryHasExtId ? entry.ext_id : currentItem.extId;

  const store = JSON.parse(currentEntry?.store || '{}');

  if (entry.store) {
    Object.assign(store, JSON.parse(entry.store));
  }
  store.extId = extId;
  entry.store = JSON.stringify(store);
});

module.exports.load = (location, entry) => {
  const store = entry?.store ? JSON.parse(entry.store) : {};
  const fields = Object.keys(location);

  if (fields.includes('extId') && !location.extId && store.extId) {
    location.extId = store.extId;
  }
  return location;
};
