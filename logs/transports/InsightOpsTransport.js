'use strict';

const winston = require('winston');
const Logger = require('r7insight_node');
const { context, trace } = require('@opentelemetry/api');
const isEmptyObject = require('../utils/isEmptyObject');
const cloneAndReplaceErrors = require('../utils/cloneAndReplaceErrors');

const stackDelim = /\n\s*/g;

class InsightOpsTransport extends winston.Transport {
  constructor(options) {
    super(options);

    const params = {
      prefix: '',
      namespace: '',
      level: 'info',
      token: '',
      region: '',
      ...options,
    };

    this.logger = new Logger({
      token: params.token,
      region: params.region,
      minLevel: params.level,
      // Winston and Insight levels are reversed
      levels: Object.entries(winston.config.npm.levels).reduce(
        (acc, [key], index, array) => {
          [, acc[key]] = array[array.length - 1 - index];
          return acc;
        },
        {},
      ),
      json: true,
      takeLevelFromLog: true,
      withLevel: false,
      withStack: true,
    });
    this.logger.on('error', (err) => this.emit(err));

    this.name = 'insightOps';
    this.level = params.level;
    this.prefix = params.prefix;
    this.namespace = params.namespace;
  }

  log(level, msg, meta, cb) {
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
    if (span) {
      const spanContext = span.spanContext();
      displayedMeta.traceId = spanContext.traceId;
      displayedMeta.spanId = spanContext.spanId;

      if (span.attributes) {
        Object.assign(displayedMeta, span.attributes);
      }
    }

    this.logger.log(
      cloneAndReplaceErrors(
        {
          level,
          prefix: this.prefix,
          namespace: meta.namespace || this.namespace,
          message: msg,
          error,
          meta: !isEmptyObject(displayedMeta) ? displayedMeta : undefined,
        },
        stackDelim,
      ),
    );

    cb(null, true);
  }
}

module.exports = InsightOpsTransport;
