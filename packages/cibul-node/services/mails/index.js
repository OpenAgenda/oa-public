'use strict';

const _ = require('lodash');
const path = require('path');
const sanitizeHtml = require('sanitize-html');

const mails = require('@openagenda/mails');
const makeLabelGetter = require('@openagenda/labels/makeLabelGetter');
const labels = require('@openagenda/labels/all').mails;
const log = require('@openagenda/logs')( 'services/mails' );

const unsubscription = require('./unsubscription');
const beforeSend = require('./lib/beforeSend');
const filterBouncingAndUnsubscribed = require('./lib/filterBouncingAndUnsubscribed');

const Queues = require('../queues');

const stripHtml = html =>
  sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });

module.exports.expose = app => {
  app.post('/incoming-emails', (req, res, next) => {
    log.info('Incoming email', {
      body: req.body,
      query: req.query
    });

    // check the replyToken
    // check if the user is an inboxUser of the conversation
    // add the message to the conversation

    res.sendStatus(200);
  });
};

module.exports.init = async config => {
  unsubscription.init(config);

  await mails.init({
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
    sendFilter: filterBouncingAndUnsubscribed.bind(null, config),
    beforeSend: beforeSend.bind(null, config)
  });
};
