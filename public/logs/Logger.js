'use strict';

const winston = require('winston');
const getTransporters = require('./getTransporters');

module.exports = class Logger extends winston.Logger {
  constructor(options = {}) {
    const {
      namespace,
      debug,
      token,
      ...superOptions
    } = options;

    super({
      transports: getTransporters({
        namespace,
        debug,
        token,
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
