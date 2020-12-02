'use strict';

const path = require('path');
const _ = require('lodash');
const winston = require('winston');
const LE = require('r7insight_node');
const DebugTransport = require('./DebugTransport');
const { getCallerFile, getModule } = require('./utils/caller');

LE.provisionWinston(winston);

let config;
const levels = Object.keys(winston.config.npm.levels);

const loggers = [];
const loggerConfigs = {};
const basicLogger = getLogger({
  $callerFile: __filename,
  $callerModule: __dirname
});

module.exports = Object.assign(
  createLogger,
  {
    init,
    setModuleConfig
  },
  basicLogger,
  _.pick(basicLogger, levels),
  getCustomProperties(basicLogger)
);

function createLogger(namespace, ...args) {
  if (levels.includes(namespace) && args.length) {
    return basicLogger[namespace](...args);
  }

  const logger = getLogger({
    namespace,
    $callerModule: args[0] ? args[0].$callerModule : undefined
  });

  logger.loadMetadata({ namespace });

  const oldClearer = logger.clearMetadata;
  logger.clearMetadata = () => {
    oldClearer();
    logger.loadMetadata({ namespace });
  };

  if (args[0]) logger.loadMetadata(_.omit(args[0], '$callerModule'));

  return logger;
}

function getLogger(options = {}) {
  const callerFile = options.$callerFile || getCallerFile(2);
  const callerModule = options.$callerModule || getModule(path.resolve(callerFile));

  const logger = new winston.Logger({
    transports: getTransporters(
      _.merge({}, options, loggerConfigs[callerModule])
    )
  });

  logger.options = options;
  logger.callerFile = callerFile;
  logger.callerModule = callerModule;

  logger.loadMetadata = loadMetadata(logger);
  logger.clearMetadata = clearMetadata(logger);
  logger.setConfig = setConfig(logger);
  logger.getTransports = getTransports(logger);

  loggers.push(logger);

  return Object.assign(
    levellessLog(logger),
    logger,
    getCustomProperties(logger)
  );
}

function getTransporters(options) {
  const params = _.merge(
    {
      namespace: '',
      debug: {
        prefix: '',
        enable: false
      },
      token: null
    },
    config,
    options
  );

  const transports = [];

  transports.push(
    new DebugTransport({
      level: 'debug',
      namespace: params.namespace,
      prefix: params.debug.prefix,
      enable: params.debug.enable
    })
  );

  if (params && params.token) {
    transports.push(
      new winston.transports.Logentries({
        level: 'info',
        token: params.token,
        region: 'eu',
        json: true,
        withStack: true
      })
    );
  }

  return transports;
}

function levellessLog(logger) {
  return (level, ...args) => (levels.includes(level) && args.length
    ? logger[level](...args)
    : logger.debug(level, ...args));
}

function getCustomProperties(logger) {
  return Object.assign(
    _.mapValues(
      _.pick(
        logger,
        'log',
        'add',
        'remove',
        'configure',
        'loadMetadata',
        'clearMetadata',
        'setConfig',
        'getTransports'
      ),
      v => v.bind(logger)
    )
  );
}

/** ******* */

function loadMetadata(logger) {
  return metadata => {
    logger.rewriters.push(function _loadMetadata (level, msg, meta) {
      if (meta && meta instanceof Error) {
        return Object.assign(meta, metadata);
      }

      return { ...metadata, ...meta };
    });
  };
}

function clearMetadata(logger) {
  return () => {
    logger.rewriters = [];

    if (logger.options.namespace) {
      logger.loadMetadata({ namespace: logger.options.namespace });
    }
  };
}

function setConfig(logger, persist = true) {
  return conf => {
    if (persist) {
      logger.persistentConfig = true;
    }

    if (logger.persistentConfig && !persist) {
      return;
    }

    const rewriters = logger.rewriters.filter(v => v.name === '_loadMetadata');

    logger.configure({
      transports: getTransporters(_.merge(logger.options, conf))
    });

    logger.rewriters = rewriters;
  };
}

function getTransports(logger) {
  return () => logger.transports;
}

/** ******* */

function init(c) {
  config = _.merge(
    {
      namespace: '',
      debug: {
        prefix: ''
      }
    },
    c
  );

  basicLogger.configure({
    transports: getTransporters(config)
  });
}

function setModuleConfig(conf, module) {
  const callerModule = module || getModule(path.resolve(getCallerFile(2)));

  loggerConfigs[callerModule] = conf;

  loggers
    .filter(logger => logger.callerModule === callerModule)
    .forEach(logger => logger.setConfig(conf, false));
}
