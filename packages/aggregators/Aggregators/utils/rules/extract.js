'use strict';

const log = require('@openagenda/logs')('extractRules');
const clean = require('./clean');

module.exports = function(type, identifier, store) {
  if (!store) return [];

  try {
    const { rules } = JSON.parse(store);
    return clean(rules);
  } catch(e) {
    log('error', 'failed to parse %s store (%s)', type, identifier, e);
  }
}
