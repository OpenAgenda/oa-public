'use strict';

const _ = require('lodash');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const createMails = require('@openagenda/mails');
const makeLabelGetter = require('@openagenda/labels/makeLabelGetter');
const labels = require('@openagenda/labels/all').mails;

const unsubscription = require('./unsubscription');
const beforeSend = require('./lib/beforeSend');
const filterBouncingAndUnsubscribed = require('./lib/filterBouncingAndUnsubscribed');
const incomingEmailsMw = require('./lib/incomingEmailsMw');
const Queues = require('../queues');
const walkProtoChain = require('../../lib/walkProtoChain');

let services;

const stripHtml = html =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });

module.exports.plugApp = app => {
  app.post('/incoming-emails', incomingEmailsMw({ services }));
};

module.exports.init = async (config, _services) => {
  services = _services;
  unsubscription.init(config);

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
    Queues,

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

  return mails;
};
