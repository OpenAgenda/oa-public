'use strict';

const winston = require('winston');
const getTransporters = require('./getTransporters');

module.exports = class Logger extends winston.Logger {
  constructor(options = {}) {
    const {
      prefix,
      namespace,
      enableDebug,
      token,
      sentry,
      otel,
      ...superOptions
    } = options;

    super({
      transports: getTransporters({
        prefix,
        namespace,
        enableDebug,
        token,
        sentry,
        otel,
      }),
      ...superOptions,
    });

    this.namespace = namespace;
  }

  loadMetadata(metadata) {
    this.rewriters.push(function _loadMetadata(level, msg, meta) {
      if (meta && meta instanceof Error) {
        return Object.assign(meta, metadata);
      }

      return { ...metadata, ...meta };
    });

    return this;
  }
};
