'use strict';

const winston = require('winston');
const DebugTransport = require('./transports/DebugTransport');
const SentryTransport = require('./transports/SentryTransport');

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
