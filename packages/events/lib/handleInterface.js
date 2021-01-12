'use strict';

const { promisify } = require('util');
const log = require('@openagenda/logs')('lib/handleInterface');

module.exports = async ({ interfaces }, interfaceName, ...args) => {
  if (!interfaces?.[interfaceName]) {
    return;
  }

  const fn = interfaces?.[interfaceName]?.callback ? promisify(interfaces?.[interfaceName]) : interfaces?.[interfaceName];

  try {
    return fn(...args);
  } catch (e) {
    log.error(e);
  }
}