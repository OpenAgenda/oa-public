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
  const { queues } = services;

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
    queueName: 'mails',
    Queues: queues,

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
  });
}
