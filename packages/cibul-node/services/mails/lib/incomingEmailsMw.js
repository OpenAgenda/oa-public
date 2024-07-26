import logs from '@openagenda/logs';

import extractMarkdownFromEmailBody from './extractMarkdownFromEmailBody.js';
import removeCrispDecoration from './removeCrispDecoration.js';

const log = logs('services/mails/incomingEmails');

const REPLY_REG = /reply\+([-0-9a-fA-F]{36})@mail\.openagenda\.com/i;

const getReplyToIfDifferent = (user, replyTo) => {
  if (!replyTo) return;
  const clean = replyTo.replace(/(.+<|>$)/g, '');
  return clean === user.email ? undefined : clean;
};

export default function incomingEmailsMw({ services }) {
  return async (req, res, next) => {
    try {
      const {
        users: usersSvc,
        inboxes: { Inbox, emailUtils },
      } = services;

      const { body } = req;

      const logBundle = { body };

      log.info('processing', logBundle);

      if (!body['X-Mailgun-Incoming']) {
        log.info('body does not have X-Mailgun-Infoming', logBundle);
        return res.sendStatus(200);
      }

      const references = (req.body.References ?? '').replace(/<|>/g, '');
      log.info('extracted references', Object.assign(logBundle, { references }));

      const conversationId = parseInt(references.split('@').shift().split('.').pop(), 10);
      log.info('extracted conversation id', Object.assign(logBundle, { conversationId }));

      if (!conversationId) {
        log.info('no conversation id was extracted', logBundle);
        return res.sendStatus(200);
      }

      const replyMatches = req.body.recipient.match(REPLY_REG);
      const replyToken = replyMatches && replyMatches[1];
      log.info('extracted replyToken', Object.assign(logBundle, { replyToken }));

      if (!replyToken) {
        log.info('no reply token was extracted', logBundle);
        return res.sendStatus(200);
      }

      const user = await usersSvc.findOne({
        query: {
          replyToken,
          ...req.body.sender.endsWith('@openagenda.on.crisp.email') ? undefined : { email: req.body.sender },
        },
      });

      if (!user) {
        log.info('no user was found', logBundle);
        return res.sendStatus(200);
      }

      const conversation = await Inbox.user(user.uid).conversations.get(conversationId);

      if (!conversation) {
        log.info('no conversation could be loaded', Object.assign(logBundle, { userUid: user.uid }));
        return res.sendStatus(200);
      }

      log.info('Incoming email', {
        userUid: user.uid,
        conversationId,
        data: req.body,
      });

      await conversation.messages.create({
        body: removeCrispDecoration(extractMarkdownFromEmailBody(req.body)),
      });

      try {
        await emailUtils(conversationId).messageIds.insert(body['Message-Id']);

        const replyTo = getReplyToIfDifferent(user, req.body['Reply-To']);

        if (replyTo && replyTo !== user.email) {
          await emailUtils(conversationId).replyTos.insert(user.uid, replyTo);
        }
      } catch (error) {
        log.error('failed to store messageId', { error });
      }

      res.sendStatus(200);
    } catch (e) {
      next(e);
    }
  };
}
