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
import escapeMd from './lib/escapeMd.js';

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
  const { bull } = services;

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
        escapeMd,
        root: config.root,
        // The new /settings has a `notifications` section (legacy `emails`).
        // SettingsPageClient also aliases the old /settings/emails path, so
        // emails already in inboxes keep working.
        emailSettingsLink: `https://${config.domain}/settings/notifications`,
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

  return Object.assign(mails, {
    plugApp,
    addressParser: createMails.addressParser,
    async shutdown() {
      await mails.worker?.close();
    },
  });
}
