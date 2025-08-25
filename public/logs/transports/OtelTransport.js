'use strict';

const winston = require('winston');
const { logs, SeverityNumber } = require('@opentelemetry/api-logs');
const { context, trace } = require('@opentelemetry/api');
const isEmptyObject = require('../utils/isEmptyObject');
const cloneAndReplaceErrors = require('../utils/cloneAndReplaceErrors');

const npmLevels = {
  error: SeverityNumber.ERROR,
  warn: SeverityNumber.WARN,
  info: SeverityNumber.INFO,
  http: SeverityNumber.DEBUG3,
  verbose: SeverityNumber.DEBUG2,
  debug: SeverityNumber.DEBUG,
  silly: SeverityNumber.TRACE,
};

class OtelTransport extends winston.Transport {
  constructor(options) {
    super(options);

    const params = {
      prefix: '',
      namespace: '',
      level: 'debug',
      ...options,
    };

    this.name = 'otel';
    this.level = params.level;
    this.prefix = params.prefix;
    this.namespace = params.namespace;

    // this.logger = logs.getLogger((this.prefix || '') + (this.namespace || ''));
    this.logger = logs.getLogger(this.name);
  }

  log(level, msg, meta, cb) {
    try {
      let error;
      const displayedMeta = {};

      if (meta instanceof Error) {
        error = meta;
      } else {
        const { error: metaError, namespace, ...restMeta } = meta;
        Object.assign(displayedMeta, restMeta);
        if (metaError instanceof Error) {
          error = metaError;
        } else if (metaError) {
          displayedMeta.error = metaError;
        }
      }

      const span = trace.getSpan(context.active());
      if (span?.attributes) {
        Object.assign(displayedMeta, span.attributes);
      }

      const attributes = cloneAndReplaceErrors({
        prefix: this.prefix,
        namespace: meta.namespace || this.namespace,
        error,
        meta: !isEmptyObject(displayedMeta) ? displayedMeta : undefined,
      });

      const namespace = (this.prefix || '') + (this.namespace || '');

      const logRecord = {
        severityNumber: npmLevels[level],
        severityText: level,
        body: `${namespace}${namespace.length && msg.length ? ': ' : ''}${msg}`,
        attributes,
        context: context.active(),
      };
      this.logger.emit(logRecord);
    } catch (error) {
      console.error(error);
    }
    cb(null, true);
  }
}

module.exports = OtelTransport;
