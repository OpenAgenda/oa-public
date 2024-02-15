'use strict';

const logs = require('@openagenda/logs');
const render = require('./templater');
const defaultFormatMessage = require('./utils/defaultFormatMessage');

const log = logs('mails/task');

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runFilterTask(config, params) {
  const logPayload = {
    recipient: params.to,
    template: params.template,
  };
  try {
    log.info('Evaluating send', logPayload);
    if (typeof config.sendFilter === 'function') {
      const allowed = await config.sendFilter(params);

      if (!allowed) {
        log.info(
          'Send prevented (ex: unsubscribed or previously bounced)',
          logPayload,
        );
        return;
      }
    }

    if (typeof config.beforeSend === 'function') {
      await config.beforeSend(params);
    }

    params.data.__ = defaultFormatMessage(
      config,
      params.template,
      params.data.lang,
    );

    Object.assign(params.data, config.defaults.data);

    const result = await render(config, params.template, params.data, {
      lang: config.defaults.lang,
      ...params,
    });

    Object.assign(params, result);

    log.info('Queuing for send', logPayload);

    config.queues.sendMails('method', params);
  } catch (error) {
    log.error('Error on sending email', { params, error });
  }
}

async function runSendTask(config, params) {
  try {
    const now = Date.now();

    await config.transporter.sendMail(params);

    log.info('Sent', {
      to: params.to,
      template: params.template,
    });

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
