'use strict';

const log = require('@openagenda/logs')('extractRules');

module.exports = function(type, identifier, store) {
  if (!store) return [];

  try {
    const { rules } = JSON.parse(store);
    return rules;
  } catch(e) {
    log('error', 'failed to parse %s store (%s)', type, identifier, e);
  }
}
