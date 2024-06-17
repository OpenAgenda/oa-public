import logs from '@openagenda/logs';

import extractMarkdownFromEmailBody from './extractMarkdownFromEmailBody.js';

const log = logs('service/mails/incomingEmails');

const REPLY_REG = /reply\+([-0-9a-fA-F]{36})@mail\.openagenda\.com/i;
const REFERENCE_REG = /inboxMessage\/(\d+)@mail\.openagenda\.com/i;

export default function incomingEmailsMw({ services }) {
  return async (req, res, next) => {
    try {
      const {
        users: usersSvc,
        inboxes: {
          Inbox,
        },
        mails: {
          addressParser,
        },
      } = services;

      const {
        body,
      } = req;

      log.info('processing', { body });

      if (!body['X-Mailgun-Incoming']) {
        log.info('body does not have X-Mailgun-Infoming', { body });
        return res.sendStatus(200);
      }

      const { address: referenceEmail } = addressParser(req.body.References)[0] || {};

      if (!referenceEmail) {
        log.info('no reference email was extracted');
        return res.sendStatus(200);
        // throw new Error('Invalid reference');
      }

      const referenceMatches = referenceEmail.match(REFERENCE_REG);
      const conversationId = parseInt(referenceMatches && referenceMatches[1], 10);

      if (!conversationId) {
        // il butte ici.
        log.info('no conversation id was extracted', { referenceEmail, References: req.body.References });
        return res.sendStatus(200);
        // throw new Error('Invalid conversation id');
      }

      const replyMatches = req.body.recipient.match(REPLY_REG);
      const replyToken = replyMatches && replyMatches[1];

      if (!replyToken) {
        log.info('no reply token was extracted');
        return res.sendStatus(200);
        // throw new Error('Invalid reply token');
      }

      const user = await usersSvc.findOne({
        query: {
          email: req.body.sender,
          replyToken,
        },
      });

      if (!user) {
        log.info('no user was found');
        return res.sendStatus(200);
        // throw new Error('User not found');
      }

      const conversation = await Inbox.user(user.uid).conversations.get(conversationId);

      if (!conversation) {
        log.info('no conversation could be loaded');
        return res.sendStatus(200);
        // throw new Error('Conversation not found');
      }

      log.info('Incoming email', {
        userUid: user.uid,
        conversationId,
        data: req.body,
      });

      await conversation.messages.create({
        body: extractMarkdownFromEmailBody(req.body),
      });

      res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  };
}
