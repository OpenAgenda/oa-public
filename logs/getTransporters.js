'use strict';

const DebugTransport = require('./transports/DebugTransport');
const SentryTransport = require('./transports/SentryTransport');
const InsightOpsTransport = require('./transports/InsightOpsTransport');

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
      new InsightOpsTransport({
        level: 'info',
        prefix: params.prefix,
        namespace: params.namespace,
        token: params.token,
        region: 'eu',
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
};
