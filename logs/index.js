'use strict';

const path = require('node:path');
const winston = require('winston');
const getTransporters = require('./getTransporters');
const Logger = require('./Logger');
const { getCallerFile, getModule } = require('./utils/caller');
const context = require('./context');

let config;
const levels = Object.keys(winston.config.npm.levels);

const loggers = new Set();
const loggerConfigs = new Map();

/** ******* */

function loadMetadata(logger) {
  return (metadata) => {
    logger.rewriters.push(function _loadMetadata(level, msg, meta) {
      if (meta && meta instanceof Error) {
        return { ...metadata, error: meta };
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
  return (conf) => {
    if (persist) {
      logger.persistentConfig = true;
    }

    if (logger.persistentConfig && !persist) {
      return;
    }

    const rewriters = logger.rewriters.filter(
      (v) => v.name === '_loadMetadata',
    );

    logger.configure({
      transports: getTransporters(config, logger.options, conf),
    });

    logger.rewriters = rewriters;
  };
}

function getTransports(logger) {
  return () => logger.transports;
}

/** ******* */

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

function levellessLog(logger) {
  return (level, ...args) =>
    (levels.includes(level) && args.length
      ? logger[level](...args)
      : logger.debug(level, ...args));
}

function getCustomProperties(logger) {
  return {
    log: logger.log.bind(logger),
    add: logger.add.bind(logger),
    remove: logger.remove.bind(logger),
    configure: logger.configure.bind(logger),
    loadMetadata: logger.loadMetadata.bind(logger),
    clearMetadata: logger.clearMetadata.bind(logger),
    setConfig: logger.setConfig.bind(logger),
    getTransports: logger.getTransports.bind(logger),
    on: logger.on.bind(logger),
    once: logger.once.bind(logger),
    close: logger.close.bind(logger),
    clear: logger.clear.bind(logger),
  };
}

function getLogger(options = {}) {
  const callerFile = options.$callerFile || getCallerFile(2);
  const callerModule = options.$callerModule || getModule(path.resolve(callerFile));

  const logger = new winston.Logger({
    transports: getTransporters(
      config,
      options,
      loggerConfigs.get(callerModule),
    ),
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
    getCustomProperties(logger),
  );
}

const basicLogger = getLogger({
  $callerFile: __filename,
  $callerModule: __dirname,
});

function createLogger(namespace, ...args) {
  if (levels.includes(namespace) && args.length) {
    return basicLogger[namespace](...args);
  }

  const logger = getLogger({
    namespace,
    $callerModule: args[0] ? args[0].$callerModule : undefined,
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
  }

  return logger;
}

function init(c) {
  config = {
    prefix: '',
    namespace: '',
    ...c,
  };

  basicLogger.configure({
    transports: getTransporters(config),
  });
}

function setModuleConfig(conf, module) {
  const callerModule = module || getModule(path.resolve(getCallerFile(2)));

  loggerConfigs.set(callerModule, conf);

  loggers.forEach((logger) => {
    if (logger.callerModule !== callerModule) return;
    logger.setConfig(conf, false);
  });
}

module.exports = Object.assign(
  createLogger,
  {
    init,
    setModuleConfig,
    createLogger2,
    context,
  },
  basicLogger,
  getCustomProperties(basicLogger),
);
