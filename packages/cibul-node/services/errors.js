"use strict";

const log = require( '@openagenda/logs' )('uncaught');

process.on( 'uncaughtException', handler.bind( null, 'uncaughtException' ) );

process.on( 'unhandledRejection', handler.bind( null, 'unhandledRejection' ) );

module.exports = handler;

module.exports.init = c => {
  log.setConfig(c.getLogConfig('oa', 'errors', false));
  return handler;
}

function handler(namespace, err) {
  try {
    throw err;
  } catch (error) {
    log('error', { error, namespace });
  }
}
