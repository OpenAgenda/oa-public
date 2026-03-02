'use strict';

const fields = require('./fields');

module.exports = (location, access = 'public') => {
  const filtered = fields
    .filter((field) => field.read.includes(access))
    .reduce(
      (acc, field) => ({
        ...acc,
        [field.field]: location[field.field],
      }),
      {},
    );

  // Preserve legacy extId property if present (added by formatExtIds for backward compatibility)
  if ('extId' in location) {
    filtered.extId = location.extId;
  }

  return filtered;
};
