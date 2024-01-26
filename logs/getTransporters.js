'use strict';

const winston = require('winston');
const DebugTransport = require('./transports/DebugTransport');
const SentryTransport = require('./transports/SentryTransport');
const context = require('./context');

module.exports = function getTransporters(...configs) {
  const params = Object.assign(
    {
      prefix: '',
      namespace: '',
      token: null,
      enableDebug: false,
    },
    ...configs,
  );

  const transports = [];

  transports.push(
    new DebugTransport({
      level: 'debug',
      prefix: params.prefix,
      namespace: params.namespace,
      enable: params.enableDebug,
    }),
  );

  if (params.token) {
    transports.push(
      new winston.transports.Logentries({
        level: 'info',
        token: params.token,
        region: 'eu',
        json: true,
        withStack: true,
        replacer(key, value) {
          if (key === '') {
            const store = context.getStore();
            if (store) {
              Object.assign(value, store);
            }
          }
          return value;
        },
      }),
    );
  }

  if (params.sentry) {
    transports.push(
      new SentryTransport({
        level: 'error',
        prefix: params.prefix,
        namespace: params.namespace,
        sentry: params.sentry,
      }),
    );
  }

  return transports;
}
