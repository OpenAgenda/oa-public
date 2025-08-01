import path from 'node:path';
import addressParser from 'nodemailer/lib/addressparser/index.js';
import { handleMjmlConfig, registerComponent } from 'mjml-core';
import isEmail from 'isemail';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import { runFilterTask, runSendTask } from './task.js';
import render from './templater.js';
import createConfig from './config.js';
import fileExists from './utils/fileExists.js';

const log = logs('mails/index');

class Mails {
  constructor(config) {
    this._rawConfig = config;
  }

  async init() {
    this.config = await createConfig(this._rawConfig);

    const { mjmlConfigPath } = this.config;

    if (mjmlConfigPath) {
      handleMjmlConfig(mjmlConfigPath, registerComponent);
    }

    this.render = render.bind(null, this.config);

    return this;
  }

  static recipientToArray(recipient) {
    return typeof recipient === 'object' && recipient !== null
      ? addressParser(recipient.address).map((v) => ({ ...recipient, ...v }))
      : recipient;
  }

  static flattenRecipients(recipients) {
    return (Array.isArray(recipients) ? recipients : [recipients]).reduce(
      (result, recipient) =>
        result.concat(
          typeof recipient === 'string'
            ? addressParser(recipient)
            : this.recipientToArray(recipient),
        ),
      [],
    );
  }

  async send(options = {}) {
    const { config } = this;

    if (options.template) {
      const templateDir = path.join(
        config.templatesDir || '',
        options.template,
      );

      if (!await fileExists(templateDir)) {
        throw new Error(`Email template '${options.template}' does not exist`);
      }
    }

    const defaultLang = 'lang' in options ? options.lang : config.defaults.lang;
    const defaultEnqueue = 'queue' in config.defaults ? config.defaults.queue : true;

    const enqueue = 'queue' in options ? options.queue : defaultEnqueue;
    const recipients = this.constructor.flattenRecipients(options.to);

    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      if (!isEmail.validate(recipient.address)) {
        const error = new VError(
          {
            info: {
              address: recipient.address,
            },
          },
          'Invalid email address',
        );
        log.error(error);
        errors.push(error);
        continue;
      }

      const params = {
        ...options,
        to: recipient,
        data: {
          lang: recipient.lang || defaultLang,
          ...options.data,
          ...recipient.data,
          ...config.defaults.data,
        },
      };

      try {
        if (!enqueue || !config.queue) {
          if (
            typeof config.sendFilter === 'function'
            && !await config.sendFilter(params)
          ) {
            log.info(
              'Send prevented (ex: unsubscribed or previously bounced)',
              {
                recipient,
                template: options.template,
              },
            );
            continue;
          }

          if (typeof config.beforeSend === 'function') {
            await config.beforeSend(params);
          }

          Object.assign(
            params,
            await this.render(params.template, params.data, params),
          );
        }

        const method = !enqueue
          ? config.transporter.sendMail.bind(config.transporter)
          : config.queue.add.bind(config.queue, 'prepareMail');
        const result = await method(params);

        results.push(result);
      } catch (error) {
        const wrappedError = new VError(
          {
            info: params,
            cause: error,
          },
          'Error on sending mail',
        );
        log.error(wrappedError);
        errors.push(wrappedError);
      }
    }

    return {
      results,
      errors,
    };
  }

  task() {
    const { config } = this;

    if (!config.queue) {
      return;
    }

    if (typeof config.createWorker === 'function') {
      log.error(
        'Queue is used, but the required createWorker method has not been implemented.',
      );
    }

    this.worker = config.createWorker((job) => {
      switch (job.name) {
        case 'prepareMail':
          return runFilterTask(config, job.data);
        case 'sendMail':
          return runSendTask(config, job.data);
        default:
          log.warn(`Unknown job ${job.name}`);
      }
    });

    this.worker.on('error', (failedReason) => log.error(failedReason));
    this.worker.on('failed', (job, error) =>
      config.onTaskError(job.name, job.data, error));

    if (!this.worker.isRunning()) {
      this.worker.run();
    }
  }
}

export default function createMails(config) {
  const svc = new Mails(config);

  return svc.init();
}

export { Mails, addressParser };
