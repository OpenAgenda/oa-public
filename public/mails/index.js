'use strict';

const path = require('node:path');
const addressParser = require('nodemailer/lib/addressparser');
const { handleMjmlConfig, registerComponent } = require('mjml-core');
const isEmail = require('isemail');
const VError = require('@openagenda/verror');
const log = require('@openagenda/logs')('mails/index');
const { runFilterTask, runSendTask } = require('./task');
const render = require('./templater');
const createConfig = require('./config');
const fileExists = require('./utils/fileExists');

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
      ? addressParser(recipient.address).map(v => ({ ...recipient, ...v }))
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
        if (!enqueue || !config.queues) {
          if (
            typeof config.sendFilter === 'function'
            && !await config.sendFilter(params)
          ) {
            log.info('Sending filtered', {
              recipient,
              template: options.template,
            });
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
          : config.queues.prepareMails.bind(
            config.queues.prepareMails,
            'method',
          );
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

    if (!config.queues) {
      return;
    }

    config.queues.prepareMails.register({
      method: runFilterTask.bind(null, this.config),
    });
    config.queues.sendMails.register({
      method: runSendTask.bind(null, this.config),
    });

    config.queues.prepareMails.on('error', config.onTaskError);
    config.queues.sendMails.on('error', config.onTaskError);

    config.queues.prepareMails.run();
    config.queues.sendMails.run();
  }
}

module.exports = function createMails(config) {
  const svc = new Mails(config);

  return svc.init();
};

Object.assign(module.exports, {
  Mails,
  addressParser,
});
