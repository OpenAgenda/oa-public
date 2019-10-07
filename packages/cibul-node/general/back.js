"use strict";

const _ = require('lodash');
const { Inbox } = require('@openagenda/inboxes');
const sessions = require('@openagenda/sessions');
const mails = require('@openagenda/mails');
const users = require('../services/users');
const cmn = require('../lib/commons-app');

function callToActionRequest(req, res) {
  const { subject, url, agenda, message } = _.pick(req.body, 'subject', 'url', 'agenda', 'message');

  mails({
    template: 'callToAction',
    to: 'commercial@openagenda.com',
    data: {
      user: req.user,
      subject,
      url,
      agenda,
      message
    }
  })
    .then(() => {
      res.json({ queued: true });
    })
    .catch(error => {
      log('error', 'Error on sending call-to-action:', error);
      res.json({ queued: false });
    });
};


function _loadUser(detailed, req, res, next) {
  users.findOne({ query: { id: req.user.id }, detailed: true })
    .then(user => {
      req.user = user;

      next();
    })
    .catch(next);
}

function latestInboxMessageTimestamp(req, res, next) {
  Inbox.user(req.user.uid).conversations.list(0, 1)
    .then(({ data }) => {
      const latestConversation = _.head(data);

      if (!latestConversation) {
        return res.send({ hasNew: false });
      }

      const timestamp = _.get(latestConversation, 'latestMessage.createdAt', null);

      if (timestamp === null) {
        return res.send({ hasNew: false });
      } else if (!req.user.lastInboxCheck) {
        return res.send({ hasNew: true });
      } else if (timestamp > req.user.lastInboxCheck) {
        return res.send({ hasNew: true });
      }

      res.send({ hasNew: false });

    })
    .catch(next);
}

module.exports = app => {
  app.post(
    '/request',
    cmn.loadLogger('request'),
    _loadUser.bind(null, false),
    callToActionRequest
  );

  app.get(
    '/latest-inbox-timestamp',
    cmn.loadLogger('latestInboxMessageTimestamp'),
    sessions.middleware.ifUnlogged((req, res) => res.send(null)),
    _loadUser.bind(null, true),
    latestInboxMessageTimestamp
  );
};
