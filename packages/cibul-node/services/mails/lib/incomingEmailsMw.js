'use strict';

const planer = require('planer');
const { JSDOM } = require('jsdom');
const TurndownService = require('turndown');
const { addressParser } = require('@openagenda/mails');
const Inboxes = require('@openagenda/inboxes').default;
const log = require('@openagenda/logs')('service/mails/incomingEmails');

const turndownService = new TurndownService();
const dom = new JSDOM('', {
  FetchExternalResources: false,
  ProcessExternalResources: false
}).window.document;

const REPLY_REG = /reply\+([-0-9a-fA-F]{36})@mail\.openagenda\.com/i;
const REFERENCE_REG = /inboxMessage\/(\d+)@mail\.openagenda\.com/i;

module.exports = ({ services }) => async (req, res, next) => {
  try {
    const usersSvc = services.users;

    if (!req.body['X-Mailgun-Incoming']) {
      return res.sendStatus(200);
    }

    const { address: referenceEmail } = addressParser(req.body['References'])[0] || {};

    if (!referenceEmail) {
      return res.sendStatus(200);
      // throw new Error('Invalid reference');
    }

    const referenceMatches = referenceEmail.match(REFERENCE_REG);
    const conversationId = parseInt(referenceMatches && referenceMatches[1], 10);

    if (!conversationId) {
      return res.sendStatus(200);
      // throw new Error('Invalid conversation id');
    }

    const replyMatches = req.body.recipient.match(REPLY_REG);
    const replyToken = replyMatches && replyMatches[1];

    if (!replyToken) {
      return res.sendStatus(200);
      // throw new Error('Invalid reply token');
    }

    const user = await usersSvc.findOne({
      query: {
        email: req.body.sender,
        replyToken
      }
    });

    if (!user) {
      return res.sendStatus(200);
      // throw new Error('User not found');
    }

    const conversation = await Inboxes.user(user.uid).conversations.get(conversationId);

    if (!conversation) {
      return res.sendStatus(200);
      // throw new Error('Conversation not found');
    }

    const body = planer.extractFrom(req.body['stripped-html'], 'text/html', dom);

    log.info('Incoming email', {
      userUid: user.uid,
      conversationId,
      data: req.body
    });

    await conversation.messages.create({
      body: turndownService.turndown(body)
    });

    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};
