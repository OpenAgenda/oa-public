'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const addressParser = require('nodemailer/lib/addressparser');
const isEmail = require('isemail');
const VError = require('verror');
const log = require('@openagenda/logs')('mails/index');
const { runFilterTask, runSendTask } = require('./task');
const templater = require('./templater');
const createConfig = require('./config');

class Mails {
  constructor(config) {
    this._rawConfig = config;
  }

  async init() {
    this.config = await createConfig(this._rawConfig);

    this.templater = {
      render: templater.render.bind(null, this.config),
      compile: templater.compile.bind(null, this.config)
    };
  }

  static recipientToArray(recipient) {
    return typeof recipient === 'object' && recipient !== null
      ? addressParser(recipient.address).map(v => ({ ...recipient, ...v }))
      : recipient;
  }

  static flattenRecipients(recipients) {
    return (Array.isArray(recipients) ? recipients : [recipients]).reduce(
      (result, recipient) => result.concat(
        typeof recipient === 'string'
          ? addressParser(recipient)
          : this.recipientToArray(recipient)
      ),
      []
    );
  }

  async send(options = {}) {
    const { config } = this;

    if (options.template) {
      const templateDir = path.join(
        config.templatesDir || '',
        options.template
      );

      if (!fs.existsSync(templateDir)) {
        throw new Error(`Email template '${options.template}' does not exist`);
      }
    }

    const defaultLang = options.lang || config.defaults.lang;
    const enqueue = typeof options.queue !== 'undefined'
      ? options.queue
      : config.defaults.queue !== false && config.queues;
    const compiled = options.template && enqueue
      ? await this.templater.compile(options.template, {
        ..._.pick(options, 'disableHtml', 'disableText', 'disableSubject'),
        lang: defaultLang
      })
      : null;
    const recipients = this.constructor.flattenRecipients(options.to);

    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      if (!isEmail.validate(recipient.address)) {
        const error = new VError(
          {
            info: {
              address: recipient.address
            }
          },
          'Invalid email address'
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
          ...config.defaults.data
        }
      };

      try {
        if (!enqueue) {
          if (typeof config.sendFilter === 'function') {
            const allowed = await config.sendFilter(params);

            if (!allowed) {
              log.info('Sending filtered', {
                recipient,
                template: options.template
              });
              continue;
            }
          }

          if (typeof config.beforeSend === 'function') {
            await config.beforeSend(params);
          }

          const labels = params.labels
            || (config.translations.labels || {})[params.template]
            || {};
          params.data.__ = config.translations.makeLabelGetter(
            labels,
            params.data.lang
          );

          if (compiled) {
            if (compiled.html) {
              params.html = compiled.html(params.data);
            }

            if (compiled.text) {
              params.text = compiled.text(params.data);
            }

            if (compiled.subject) {
              params.subject = compiled.subject(params.data);
            }
          } else {
            Object.assign(
              params,
              await this.templater.render(params.template, params.data, params)
            );
          }
        }

        const method = !enqueue
          ? config.transporter.sendMail.bind(config.transporter)
          : config.queues.prepareMails.bind(
            config.queues.prepareMails,
            'method'
          );
        const result = await method(params);

        results.push(result);
      } catch (error) {
        const wrappedError = new VError(
          {
            info: params,
            cause: error
          },
          'Error on sending mail'
        );
        log.error(wrappedError);
        errors.push(wrappedError);
      }
    }

    return {
      results,
      errors
    };
  }

  task() {
    const { config } = this;

    if (!config.queues) {
      return;
    }

    config.queues.prepareMails.register({
      method: runFilterTask.bind(null, this.config)
    });
    config.queues.sendMails.register({
      method: runSendTask.bind(null, this.config)
    });

    config.queues.prepareMails.on('error', config.onTaskError);
    config.queues.sendMails.on('error', config.onTaskError);

    config.queues.prepareMails.run();
    config.queues.sendMails.run();
  }
}

Mails.templater = templater;
Mails.addressParser = addressParser;

module.exports = Mails;
