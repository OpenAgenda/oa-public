'use strict';

const log = require('@openagenda/logs')('lib/handleInterface');

module.exports = async ({ interfaces }, interfaceName, ...args) => {
  if (!interfaces?.[interfaceName]) {
    return;
  }
  try {
    return interfaces[interfaceName].apply(null, args);
  } catch (e) {
    log.error(e);
  }
}