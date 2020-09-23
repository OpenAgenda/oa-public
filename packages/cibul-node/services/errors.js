"use strict";

const log = require( '@openagenda/logs' )('uncaught');

process.on( 'uncaughtException', handler.bind( null, 'uncaughtException' ) );

process.on( 'unhandledRejection', handler.bind( null, 'unhandledRejection' ) );

module.exports = handler;

module.exports.init = c => {
  log.setConfig(c.getLogConfig('oa', 'errors', false));
  return handler;
}

function handler(namespace, err, req) {
  try {
    throw err;
  } catch (error) {
    const obj = {
      error,
      namespace
    };

    if (req) {
      Object.assign(obj, {
        url: req.originalUrl,
        ip: (req.header('x-forwarded-for') || '').split(', ').shift(),
        userUid: req.user && req.user.uid ? req.user.uid : null
      });
    }

    log('error', obj);
  }
}
