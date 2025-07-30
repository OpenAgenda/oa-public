import logs from '@openagenda/logs';
import render from './templater.js';
import defaultFormatMessage from './utils/defaultFormatMessage.js';

const log = logs('mails/task');

export async function runFilterTask(config, params) {
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

    config.queue.add('sendMail', params);
  } catch (error) {
    log.error('Error on sending email', { params, error });
  }
}

export async function runSendTask(config, params) {
  try {
    await config.transporter.sendMail(params);

    log.info('Sent', {
      to: params.to,
      template: params.template,
    });
  } catch (error) {
    log.error('Error on sending email', { params, error });
  }
}
