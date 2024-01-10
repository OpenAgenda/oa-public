import path from 'node:path';
import { fileURLToPath } from 'node:url';
import _ from 'lodash';
import sanitizeHTML from 'sanitize-html';
import createMails from '@openagenda/mails';

import defineUnsubscriptionLinks from './lib/defineUnsubscriptionLinks.mjs';
import filterBouncingAndUnsubscribed from './lib/filterBouncingAndUnsubscribed.mjs';

import plugApp from './plugApp.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const stripHtml = html => sanitizeHTML(html, { allowedTags: [], allowedAttributes: {} });

export async function init(config, services) {
  const {
    queues,
  } = services;

  const mails = await createMails({
    // Templating
    templatesDir: path.join(__dirname, 'templates'),

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
    beforeSend: params => defineUnsubscriptionLinks(services, config, params),
  });

  return Object.assign(mails, {
    plugApp,
  });
}
