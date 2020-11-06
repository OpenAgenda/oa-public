'use strict';

const ih = require('immutability-helper');

module.exports.patch = (entry, store, current) => {
  const patch = { entry: {}, store: {} };

  const entryHasExtId = Object.keys(entry).includes('ext_id');
  const extId = entryHasExtId ? entry.ext_id : current.extId;

  patch.store = {
    extId: { $set: extId }
  };

  if (entry.ext_id !== extId) {
    patch.entry.ext_id = {
      $set: extId
    };
  }

  return {
    entry: Object.keys(patch.entry).length ? ih(entry, patch.entry) : entry,
    store: Object.keys(patch.store).length ? ih(store, patch.store) : store
  };
}

module.exports.load = (location, entry, store, options) => {
  const fields = Object.keys(location);

  const patch = {};

  if (fields.includes('extId') && store.extId) {
    patch.extId = {
      $set: store.extId
    };
  }

  return Object.keys(patch).length ? ih(location, patch) : location;
}
