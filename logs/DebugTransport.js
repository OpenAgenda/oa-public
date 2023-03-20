'use strict';

const util = require('util');
const winston = require('winston');
const debug = require('debug');

const isEmptyObject = obj => obj && Object.keys(obj).length === 0 && obj.constructor === Object;

class DebugTransport extends winston.Transport {
  constructor(options) {
    super(options);

    const params = {
      namespace: '', prefix: '', level: 'debug',
      ...options,
    };

    this.name = 'debug';
    this.level = params.level;
    this.prefix = params.prefix;
    this.namespace = params.namespace;

    const debugName = this.getDebugName();

    if (!process.env.DEBUG && params.enable && !debug.enabled(debugName)) {
      debug.names.push(new RegExp(`^${  debugName.replace(/\*/g, '.*?')  }$`));
    }

    this.debug = debug(debugName);
  }

  getDebugName(namespace) {
    return (this.prefix || '') + (namespace || this.namespace || '');
  }

  log(level, msg, meta, cb) {
    let displayedMeta;

    if (meta instanceof Error) {
      displayedMeta = meta;
    } else {
      const { namespace, ...metaToKeep } = meta;
      displayedMeta = metaToKeep;
    }

    const args = [msg].concat(
      typeof displayedMeta !== 'undefined' && !isEmptyObject(displayedMeta)
        ? util.inspect(displayedMeta, { colors: this.debug.useColors })
        : [],
    );

    // Overwrite namespace
    const originalNamespace = this.debug.namespace;
    this.debug.namespace = this.getDebugName(meta.namespace);

    // Log
    this.debug.apply(this.debug, args);

    // Restore namespace
    this.debug.namespace = originalNamespace;

    cb(null, true);
  }
}

module.exports = DebugTransport;
