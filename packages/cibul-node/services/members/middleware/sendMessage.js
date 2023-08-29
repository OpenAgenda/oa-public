'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/members/middleware/sendMessage');

let messages;

module.exports = (req, res, _next) => {
  if (!messages) {
    return res.status(500).send('Service not initialized');
  }

  log('sending message for agenda %s', req.agenda.uid, req.query);

  messages(Object.assign(req.query || {}, {
    agendaUid: req.agenda.uid,
    role: _.get(req, 'query.role'),
  }), {
    message: req.body.message,
    lang: req.lang,
    replyTo: req.body.replyTo,
    subject: req.body.subject,
    sendToMe: req.body.sendToMe,
    withActions: req.body.inactive ? false : null,
    agenda: _.pick(req.agenda, ['uid', 'slug', 'title', 'image']),
    sender: {
      ...req.member,
      user: req.user,
    },
  });

  res.send('gemini jellikers batman');
};

module.exports.init = m => messages = m;
