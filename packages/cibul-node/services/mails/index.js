import path from 'node:path';
import _ from 'lodash';
import sanitizeHTML from 'sanitize-html';
import { registerComponent } from 'mjml-core';
import { registerDependencies } from 'mjml-validator';
import createMails from '@openagenda/mails';
import defineUnsubscriptionLinks from './lib/defineUnsubscriptionLinks.js';
import filterBouncingAndUnsubscribed from './lib/filterBouncingAndUnsubscribed.js';
import plugApp from './plugApp.js';
import MjMarkdown from './components/MjMarkdown.js';
import MjContent from './components/MjContent.js';
import MjPrev from './components/MjPrev.js';

const mjmlComponents = [MjMarkdown, MjContent, MjPrev];

// register ESM components manually
for (const component of mjmlComponents) {
  registerComponent(component);
  if (component.dependencies) {
    registerDependencies(component.dependencies);
  }
}

const stripHtml = (html) =>
  sanitizeHTML(html, { allowedTags: [], allowedAttributes: {} });

export async function init(config, services) {
  const { queues, bull } = services;

  const oldPrepareQueue = queues('pre-mails');
  const oldSendQueue = queues('mails');

  const queue = new bull.Queue('mails', { prefix: '{mails}' });
  const createWorker = (processor) =>
    new bull.Worker(queue.name, processor, {
      prefix: queue.opts.prefix,
      autorun: false,
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep up to 7 days
        count: 1000, // keep up to 1000 jobs
      },
    });

  const mails = await createMails({
    // Templating
    templatesDir: path.join(import.meta.dirname, 'templates'),

    // Mailing
    transport: config.mails.transport,
    defaults: {
      ...config.mails.defaults,
      data: {
        _,
        stripHtml,
        root: config.root,
        emailSettingsLink: `https://${config.domain}/settings/emails`,
      },
    },

    // Queuing
    queue,
    createWorker,

    // Logging
    logger: config.getLogConfig('svc', 'mails', false),

    disableVerify: config.mails.disableVerify,

    // Unsubscription
    sendFilter: filterBouncingAndUnsubscribed.bind(null, services, config),
    beforeSend: (params) => defineUnsubscriptionLinks(services, config, params),
  });

  const originalTask = mails.task.bind(mails);

  return Object.assign(mails, {
    plugApp,
    addressParser: createMails.addressParser,
    async shutdown() {
      await oldPrepareQueue.stop();
      await oldSendQueue.stop();
      await mails.worker?.close();
    },
    task: () => {
      originalTask();

      oldPrepareQueue.register({
        method: (data) => queue.add('prepareMail', data),
      });
      oldSendQueue.register({
        method: (data) => queue.add('sendMail', data),
      });

      oldPrepareQueue.run();
      oldSendQueue.run();
    },
  });
}
