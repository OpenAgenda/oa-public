'use strict';

const path = require('path');
const nodemailer = require('nodemailer');
const VError = require('verror');
const logs = require('@openagenda/logs');
const makeLabelGetter = require('./utils/makeLabelGetter');

const log = logs('mails/config');
const logTransporter = logs('mails/transporter');

const defaultConfig = {
  templatesDir:
    process.env.MAILS_TEMPLATES_DIR || path.join(process.cwd(), 'templates'),
  mjmlConfigPath: process.cwd(),
  transport: {
    pool: true,
    host: '127.0.0.1',
    port: '1025',
    maxMessages: Infinity,
    maxConnections: 20,
    rateLimit: 14, // 14 emails/second max
    rateDelta: 1000,
  },
  defaults: {},
  translations: {
    labels: {},
    makeLabelGetter,
  },
  queueName: 'mails',
  disableVerify: false,
  onTaskError(method, args, error) {
    log.error('Error on sending email in task', { args, error });
  },
};

async function createConfig(c = {}) {
  if (c.logger) {
    logs.setModuleConfig(c.logger);
  }

  const config = { ...defaultConfig, ...c };

  // Queue
  if (config.Queues) {
    config.queues = {
      prepareMails: await config.Queues(`pre-${config.queueName}`),
      sendMails: await config.Queues(config.queueName),
    };
  }

  const transportLogger = {
    error: (data, ...rest) => logTransporter.error(...rest, data),
    warn: (data, ...rest) => logTransporter.warn(...rest, data),
    info: (data, ...rest) => logTransporter.info(...rest, data),
    debug: (data, ...rest) => logTransporter.debug(...rest, data),
  };

  // Transporter
  config.transporter = nodemailer.createTransport(
    {
      ...config.transport,
      logger: transportLogger,
      rateLimit: undefined,
    },
    config.defaults
  );

  if (!config.disableVerify) {
    try {
      await config.transporter.verify();
    } catch (error) {
      const wrappedError = new VError(
        error,
        'Invalid transporter configuration'
      );
      log.error(wrappedError);
      throw wrappedError;
    }
  }

  return config;
}

module.exports = createConfig;
