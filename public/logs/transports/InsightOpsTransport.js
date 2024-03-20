'use strict';

const winston = require('winston');
const Logger = require('r7insight_node');
const isEmptyObject = require('../utils/isEmptyObject');
const context = require('../context');

const stackDelim = /\n\s*/g;

// enhanced VError.prototype.toJSON
function errorToJSON(error) {
  const obj = {
    name: error.name || 'Error',
    message: error.message,
    shortMessage: undefined, // to keep order
    stack: undefined, // to keep order
  };

  Object.assign(obj, error);

  if (error.shortMessage) {
    obj.shortMessage = error.shortMessage;
  }

  obj.stack = error.stack && error.stack.split(stackDelim);

  if (error.cause) {
    obj.cause = errorToJSON(error.cause);
  }

  if (error.info) {
    obj.info = error.info;
  }

  // Conserve keys order in obj
  for (const key in error['@@verror/meta']) {
    if (Object.prototype.hasOwnProperty.call(error['@@verror/meta'], key) && !(key in obj)) {
      obj[key] = error['@@verror/meta'][key];
    }
  }

  return obj;
}

function cloneAndReplaceErrors(obj) {
  function deepClone(item) {
    if (item === null || typeof item !== 'object') {
      return item;
    }

    if (item instanceof Error) {
      return errorToJSON(item);
    }

    if (Array.isArray(item)) {
      return item.map(deepClone);
    }

    const clone = {};
    for (const [key, value] of Object.entries(item)) {
      clone[key] = deepClone(value);
    }
    return clone;
  }

  return deepClone(obj);
}

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
      levels: Object.entries(winston.config.npm.levels)
        .reduce((acc, [key, value], index, array) => {
          acc[key] = array[array.length - 1 - index][1];
          return acc;
        }, {}),
      json: true,
      takeLevelFromLog: true,
      withLevel: false,
      withStack: true,
    });
    this.logger.on('error', err => this.emit(err));

    this.name = 'insightOps';
    this.level = params.level;
    this.prefix = params.prefix;
    this.namespace = params.namespace;
  }

  log(level, msg, meta, cb) {
    let error;
    let displayedMeta = {};

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

    const store = context.getStore();

    if (store) {
      Object.assign(displayedMeta, store);
    }

    this.logger.log(cloneAndReplaceErrors({
      level,
      prefix: this.prefix,
      namespace: meta.namespace || this.namespace,
      message: msg,
      error,
      meta: !isEmptyObject(displayedMeta) ? displayedMeta : undefined,
    }));

    cb(null, true);
  }
}

module.exports = InsightOpsTransport;
