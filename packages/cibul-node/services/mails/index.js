'use strict';

const path = require('path');
const _ = require('lodash');
const sanitizeHtml = require('sanitize-html');

const createMails = require('@openagenda/mails');
const makeLabelGetter = require('@openagenda/labels/makeLabelGetter');
const labels = require('@openagenda/labels/all').mails;

const walkProtoChain = require('../../lib/walkProtoChain');

const unsubscription = require('./unsubscription');
const beforeSend = require('./lib/beforeSend');
const filterBouncingAndUnsubscribed = require('./lib/filterBouncingAndUnsubscribed');
const incomingEmailsMw = require('./lib/incomingEmailsMw');

const stripHtml = html => sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });

module.exports.init = async (config, services) => {
  unsubscription.init(config);

  const {
    queues
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
        emailSettingsLink: `https://${config.domain}/settings/emails`
      }
    },

    // Localization
    translations: {
      labels,
      makeLabelGetter
    },

    // Queuing
    redis: config.redis,
    queueName: 'mails',
    Queues: queues,

    // Logging
    logger: config.getLogConfig('svc', 'mails', false),

    disableVerify: config.mails.disableVerify,

    // Unsubscription
    sendFilter: filterBouncingAndUnsubscribed.bind(null, services, config),
    beforeSend: beforeSend.bind(null, services, config)
  });

  for (const prop of walkProtoChain(mails)) {
    module.exports[prop] = typeof mails[prop] === 'function'
      ? mails[prop].bind(mails)
      : mails[prop];
  }

  return Object.assign(mails, {
    unsubscription,
    plugApp: app => {
      app.post('/incoming-emails', incomingEmailsMw({ services }));
    }
  });
};
