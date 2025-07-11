'use strict';

const winston = require('winston');
const { context, trace } = require('@opentelemetry/api');
const cloneError = require('../utils/cloneError');

class SentryTransport extends winston.Transport {
  constructor(options) {
    super(options);

    const params = {
      prefix: '',
      namespace: '',
      level: 'error',
      levelsMap: {
        silly: 'debug',
        debug: 'debug',
        verbose: 'debug',
        info: 'info',
        warn: 'warning',
        error: 'error',
      },
      ...options,
    };

    this.name = 'sentry';
    this.level = params.level;
    this.prefix = params.prefix;
    this.namespace = params.namespace;
    this.levelsMap = params.levelsMap;

    this.sentry = params.sentry;
  }

  log(level, msg, meta, cb) {
    const namespace = meta.namespace || this.namespace;
    let error;
    const displayedMeta = {
      prefix: this.prefix,
      namespace,
    };

    if (meta instanceof Error) {
      error = meta;
    } else {
      const { error: metaError, ...restMeta } = meta;
      Object.assign(displayedMeta, restMeta);
      if (metaError instanceof Error) {
        error = metaError;
      } else {
        displayedMeta.error = metaError;
      }
    }

    if (msg.length) {
      if (error) {
        const enhancedError = cloneError(error);
        enhancedError.message = `${msg} ${error.name}${error.message.length ? `: ${error.message}` : ''}`;

        error = enhancedError;
      } else {
        error = new Error(msg);

        const stacktrace = error.stack.split('\n');
        const index = stacktrace.findIndex((ligne) =>
          ligne.includes(`[as ${level}]`));
        stacktrace.splice(1, index);

        error.stack = stacktrace.join('\n');
      }
    }

    if (!error) {
      return cb(null, true);
    }

    const span = trace.getSpan(context.active());

    this.sentry.withScope((scope) => {
      const ns = this.prefix + namespace;

      scope.setLevel(this.levelsMap[level]);
      scope.setTag('namespace', ns);

      if (span?.attributes) {
        scope.setTags(span.attributes);
      }

      scope.setContext('data', displayedMeta);

      scope.addEventProcessor((event) => {
        const txName = event.transaction || '';
        const separator = ns.length && txName.length ? ' | ' : '';
        event.transaction = `${ns}${separator}${txName}`;
        return event;
      });

      this.sentry.captureException(error);
    });

    cb(null, true);
  }
}

module.exports = SentryTransport;
