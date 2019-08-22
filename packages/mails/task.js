'use strict';

const _ = require('lodash');
const logs = require('@openagenda/logs');
const templater = require('./templater');
const config = require('./config');

const log = logs('mails/task');

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const onError = (method, args, error) => {
  log.error('Error on sending email in task', { args, error });
};

async function runFilterTask(params) {
  try {
    if (typeof config.sendFilter === 'function') {
      const allowed = await config.sendFilter(params);

      if (!allowed) {
        log.info('Sending filtered', {
          recipient: params.to,
          template: params.template
        });
        return;
      }
    }

    if (typeof config.beforeSend === 'function') {
      await config.beforeSend(params);
    }

    const labels = (config.translations.labels || {})[params.template] || {};
    params.data.__ = config.translations.makeLabelGetter(
      labels,
      params.data.lang
    );

    Object.assign(params.data, config.defaults.data);

    const defaultLang = params.lang || config.defaults.lang;
    const result = await templater.render(params.template, params.data, {
      ..._.pick(params, 'disableHtml', 'disableText', 'disableSubject'),
      lang: defaultLang
    });

    Object.assign(params, result);

    config.queues.sendMails('method', params);
  } catch (error) {
    log.error('Error on sending email', { params, error });
  }
}

async function runSendTask(params) {
  try {
    const now = Date.now();

    await config.transporter.sendMail(params);

    const timeDiff = Date.now() - now;
    const interval = config.transport.rateDelta / config.transport.rateLimit;
    const timeToWait = timeDiff > interval ? 0 : interval - timeDiff;

    if (timeToWait) {
      await _sleep(timeToWait);
    }
  } catch (error) {
    log.error('Error on sending email', { params, error });
  }
}

module.exports = function task() {
  if (!config.queues) {
    return;
  }

  config.queues.prepareMails.register({ method: runFilterTask });
  config.queues.sendMails.register({ method: runSendTask });

  config.queues.prepareMails.on('error', onError);
  config.queues.sendMails.on('error', onError);

  config.queues.prepareMails.run();
  config.queues.sendMails.run();
};
