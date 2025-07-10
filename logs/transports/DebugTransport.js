'use strict';

const util = require('node:util');
const winston = require('winston');
const debug = require('debug');
const { context, trace } = require('@opentelemetry/api');
const cloneError = require('../utils/cloneError');
const isEmptyObject = require('../utils/isEmptyObject');

class DebugTransport extends winston.Transport {
  constructor(options) {
    super(options);

    const params = {
      prefix: '',
      namespace: '',
      level: 'debug',
      enable: false,
      ...options,
    };

    this.name = 'debug';
    this.level = params.level;
    this.prefix = params.prefix;
    this.namespace = params.namespace;

    const debugName = this.getDebugName();

    if (!process.env.DEBUG && params.enable && !debug.enabled(debugName)) {
      debug.names.push(new RegExp(`^${debugName.replace(/\*/g, '.*?')}$`));
    }

    this.debug = debug(debugName);
  }

  getDebugName(namespace) {
    return (this.prefix || '') + (namespace || this.namespace || '');
  }

  log(level, msg, meta, cb) {
    let displayedMeta;

    if (meta instanceof Error) {
      displayedMeta = cloneError(meta);
    } else {
      const { namespace, error, ...metaToKeep } = meta;
      if (error && Object.keys(metaToKeep).length === 0) {
        displayedMeta = error;
      } else {
        displayedMeta = metaToKeep;
      }
    }

    const span = trace.getSpan(context.active());
    if (span) {
      const spanContext = span.spanContext();
      displayedMeta.traceId = spanContext.traceId;
      displayedMeta.spanId = spanContext.spanId;

      if (span.attributes) {
        Object.assign(displayedMeta, span.attributes);
      }
    }

    const args = (msg.length ? [msg] : []).concat(
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
