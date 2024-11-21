import fs from 'node:fs/promises';
import path from 'node:path';
import nodemailer from 'nodemailer';
import mg from 'nodemailer-mailgun-transport';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import { getFallbackedMessages, getSupportedLocale } from '@openagenda/intl';
import { createIntl, createIntlCache } from '@formatjs/intl';
import fileExists from './utils/fileExists.js';

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
  queueName: 'mails',
  disableVerify: false,
  onTaskError(method, args, error) {
    log.error('Error on sending email in task', { args, error });
  },
};

async function createMultiIntl(templatesDir) {
  const templates = await fs.readdir(templatesDir);
  const cache = createIntlCache();
  const messagesPerLang = {};

  for (const template of templates) {
    const localesPath = path.join(templatesDir, template, 'locales');

    if (!await fileExists(localesPath)) {
      continue;
    }

    const localeFiles = await fs.readdir(localesPath);

    for (const localeFile of localeFiles) {
      const { name: lang, ext } = path.parse(localeFile);

      if (lang === 'io') {
        continue;
      }

      const locales = (
        await import(
          path.join(localesPath, localeFile),
          ext === '.json' ? { with: { type: 'json' } } : null
        )
      ).default;

      messagesPerLang[lang] = Object.keys(locales).reduce((accu, key) => {
        accu[`${template}.${key}`] = locales[key];
        return accu;
      }, messagesPerLang[lang] || {});
    }
  }

  const result = {};

  const fallbackedMessages = getFallbackedMessages(messagesPerLang);

  for (const lang in fallbackedMessages) {
    if (Object.prototype.hasOwnProperty.call(fallbackedMessages, lang)) {
      result[lang] = createIntl(
        {
          locale: lang,
          messages: fallbackedMessages[lang],
          defaultLocale: getSupportedLocale(lang),
          onError(e) {
            if (e.code !== 'MISSING_DATA') {
              console.error(e);
            }
          },
        },
        cache,
      );
    }
  }

  return result;
}

async function createConfig(c = {}) {
  if (c.logger) {
    logs.setModuleConfig(c.logger);
  }

  const config = { ...defaultConfig, ...c };

  if (!config.cache) {
    config.cache = new Map();
  }

  if (!config.intl) {
    config.intl = await createMultiIntl(config.templatesDir);
  }

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
  if (config.transport.mailgun) {
    const transporter = mg({
      ...config.transport.mailgun,
      logger: transportLogger,
    });
    const originalSend = transporter.send;
    transporter.send = async (mail, cb) =>
      originalSend(
        {
          ...mail,
          data: {
            ...mail.data,
            ...mail.data.references
              ? { 'h:References': mail.data.references }
              : undefined,
            ...mail.data.inReplyTo
              ? { 'h:InReplyTo': mail.data.inReplyTo }
              : undefined,
          },
        },
        (err, result) => {
          const envelope = mail.message.getEnvelope();
          const messageId = mail.message.messageId();
          const recipients = [].concat(envelope.to || []);
          if (recipients.length > 3) {
            recipients.push(`...and ${recipients.splice(2).length} more`);
          }

          if (err) {
            transportLogger.error(
              `Send error for ${messageId}: ${err.message}`,
            );
          } else {
            transportLogger.info(
              `Sending message ${messageId} to <${recipients.join(', ')}>`,
            );
          }
          cb(err, result);
        },
      );
    config.transporter = nodemailer.createTransport(
      transporter,
      config.defaults,
    );
  } else {
    config.transporter = nodemailer.createTransport(
      {
        ...config.transport,
        logger: transportLogger,
        rateLimit: undefined,
      },
      config.defaults,
    );
  }

  if (!config.disableVerify) {
    try {
      await config.transporter.verify();
    } catch (error) {
      const wrappedError = new VError(
        error,
        'Invalid transporter configuration',
      );
      log.error(wrappedError);
      throw wrappedError;
    }
  }

  return config;
}

export default createConfig;
