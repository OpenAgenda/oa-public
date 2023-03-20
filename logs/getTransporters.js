'use strict';

const winston = require('winston');
const DebugTransport = require('./DebugTransport');
const mergeConfig = require('./mergeConfig');

module.exports = function getTransporters(...configs) {
  const params = mergeConfig(
    {
      namespace: '',
      token: null,
      debug: {
        prefix: '',
        enable: false,
      },
    },
      ...configs,
  );

  const transports = [];

  transports.push(
    new DebugTransport({
      level: 'debug',
      namespace: params.namespace,
      prefix: params.debug.prefix,
      enable: params.debug.enable,
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

  return transports;
}
