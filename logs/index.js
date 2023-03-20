'use strict';

const path = require('path');
const winston = require('winston');
const LE = require('r7insight_node');
const getTransporters = require('./getTransporters');
const Logger = require('./Logger');
const mergeConfig = require('./mergeConfig');
const { getCallerFile, getModule } = require('./utils/caller');

LE.provisionWinston(winston);

let config;
const levels = Object.keys(winston.config.npm.levels);

const loggers = new Set();
const loggerConfigs = new Map();

const basicLogger = getLogger({
  $callerFile: __filename,
  $callerModule: __dirname
});

module.exports = Object.assign(
  createLogger,
  {
    init,
    setModuleConfig,
    createLogger2,
  },
  basicLogger,
  getCustomProperties(basicLogger)
);

function createLogger2(namespace, options = {}) {
  const callerFile = options.$callerFile || getCallerFile(2);
  const callerModule = options.$callerModule || getModule(path.resolve(callerFile));

  return new Logger({
    ...config,
    ...loggerConfigs.get(callerModule),
    namespace,
    ...options,
  });
}

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

  if (args[0]) {
    const { $callerModule, ...meta } = args[0];
    logger.loadMetadata(meta);
  };

  return logger;
}

function getLogger(options = {}) {
  const callerFile = options.$callerFile || getCallerFile(2);
  const callerModule = options.$callerModule || getModule(path.resolve(callerFile));

  const logger = new winston.Logger({
    transports: getTransporters(
      config,
      options,
      loggerConfigs.get(callerModule)
    )
  });

  logger.options = options;
  logger.callerFile = callerFile;
  logger.callerModule = callerModule;

  logger.loadMetadata = loadMetadata(logger);
  logger.clearMetadata = clearMetadata(logger);
  logger.setConfig = setConfig(logger);
  logger.getTransports = getTransports(logger);

  loggers.add(logger);

  return Object.assign(
    levellessLog(logger),
    logger,
    getCustomProperties(logger)
  );
}

function levellessLog(logger) {
  return (level, ...args) => (levels.includes(level) && args.length
    ? logger[level](...args)
    : logger.debug(level, ...args));
}

function getCustomProperties(logger) {
  const {
    log,
    add,
    remove,
    configure,
    loadMetadata,
    clearMetadata,
    setConfig,
    getTransports,
    on,
    once,
    close,
    clear,
  } = logger;

  return {
    log: log.bind(logger),
    add: add.bind(logger),
    remove: remove.bind(logger),
    configure: configure.bind(logger),
    loadMetadata: loadMetadata.bind(logger),
    clearMetadata: clearMetadata.bind(logger),
    setConfig: setConfig.bind(logger),
    getTransports: getTransports.bind(logger),
    on: on.bind(logger),
    once: once.bind(logger),
    close: close.bind(logger),
    clear: clear.bind(logger),
  };
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
      transports: getTransporters(config, logger.options, conf)
    });

    logger.rewriters = rewriters;
  };
}

function getTransports(logger) {
  return () => logger.transports;
}

/** ******* */

function init(c) {
  config = mergeConfig(
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

  loggerConfigs.set(callerModule, conf);

  loggers.forEach(logger => {
    if (logger.callerModule !== callerModule) return;
    logger.setConfig(conf, false);
  });
}
