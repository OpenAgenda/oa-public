'use strict';

const logs = require('@openagenda/logs');
const render = require('./templater');

const log = logs('mails/task');

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFilterTask(config, params) {
  try {
    if (typeof config.sendFilter === 'function') {
      const allowed = await config.sendFilter(params);

      if (!allowed) {
        log.info('Sending filtered', {
          recipient: params.to,
          template: params.template,
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
    const { disableHtml, disableText, disableSubject } = params;
    const result = await render(config, params.template, params.data, {
      disableHtml,
      disableText,
      disableSubject,
      lang: defaultLang,
    });

    Object.assign(params, result);

    config.queues.sendMails('method', params);
  } catch (error) {
    log.error('Error on sending email', { params, error });
  }
}

async function runSendTask(config, params) {
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

module.exports = {
  runFilterTask,
  runSendTask,
};
