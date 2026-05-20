import express from 'express';
import * as inboxMw from '@openagenda/inboxes/src/middleware.js';
import VError from '@openagenda/verror';
import { requireUser } from '../../../../lib/authGuards.js';
import makeErrorHandler from './makeErrorHandler.js';

export default (config, services) => {
  const { agendas, members } = services;

  const errorHandler = makeErrorHandler(services);

  const preMw = [
    requireUser,
    (req, res, next) => {
      req.type = 'agenda';
      req.creatorInboxUser = { userUid: req.user.uid };
      next();
    },
    agendas.mw.loadBy({ path: 'params.agendaUid', field: 'uid' }),
    members.mw.loadAndAuthorize('moderator'),
    (req, res, next) => {
      if (!req.agenda) {
        res.status(404);
        return next(new VError('Agenda %s not found', req.params.agendaUid));
      }
      next();
    },
  ];

  const router = express.Router({ mergeParams: true });

  router.get(
    '/conversations/:conversationId/action/:code.json',
    preMw,
    inboxMw.conversations.action({
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'agenda.uid',
        userUid: 'user.uid',
        code: 'params.code',
      },
    }),

    errorHandler,
  );

  router.get(
    '/conversations/:conversationId/resume.json',
    preMw,
    inboxMw.conversations.resume({
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'agenda.uid',
        userUid: 'user.uid',
      },
    }),

    errorHandler,
  );

  router.get(
    '/conversations/:conversationId/messages.json',
    preMw,
    inboxMw.messages.list({
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'agenda.uid',
        userUid: 'user.uid',
      },
      limit: 20,
    }),

    errorHandler,
  );

  router.post(
    '/conversations/:conversationId/messages.json',
    preMw,
    (req, res, next) => {
      req.options = {
        // createInboxUserOnNull: true
      };
      next();
    },
    inboxMw.messages.create({
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'agenda.uid',
        body: 'body.body',
        userUid: 'user.uid',
      },
    }),

    errorHandler,
  );

  router.get(
    '/conversations.json',
    preMw,
    (req, res, next) => {
      inboxMw.conversations.list({
        namespaces: {
          type: 'type',
          identifier: 'agenda.uid',
        },
        limit: req.query.limit || 20,
      })(req, res, next);
    },

    errorHandler,
  );

  router.post(
    '/conversations.json',
    preMw,
    (req, res, next) => {
      req.options = {
        // createInboxUserOnNull: true
      };
      next();
    },
    inboxMw.conversations.create({
      namespaces: {
        type: 'type',
        identifier: 'agenda.uid',
        destinationInbox: 'body.destinationInbox',
        conversationType: 'body.type',
        conversationTypeIdentifier: 'body.typeIdentifier',
        params: 'body.params',
        message: 'body.message',
        creatorInboxUser: 'creatorInboxUser',
      },
    }),

    errorHandler,
  );

  router.use(
    '/conversations/:conversationId/prepare-attachment',
    preMw,
    inboxMw.messages.prepareAttachment({
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'agenda.uid',
        userUid: 'user.uid',
        messageId: 'query.metadata.messageId',
      },
    }),
    errorHandler,
  );

  router.use(
    '/conversations/:conversationId/upload-attachment',
    preMw,
    inboxMw.messages.uploadAttachment({
      files: services.files,
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'agenda.uid',
        userUid: 'user.uid',
        messageId: 'body.messageId',
      },
    }),
    errorHandler,
  );

  router.use(
    '/conversations/:conversationId/add-attachment',
    preMw,
    inboxMw.messages.addAttachment({
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'agenda.uid',
        userUid: 'user.uid',
        messageId: 'query.messageId',
        filename: 'query.filename',
        originalName: 'query.originalName',
        index: 'query.index',
      },
    }),

    errorHandler,
  );

  router.get(
    '/author.json',
    preMw,
    (req, res, next) => {
      inboxMw.inboxUser.get({
        namespaces: {
          type: 'type',
          identifier: 'agenda.uid',
        },
        fallbackGetter: () => ({
          name: req.user.name,
          avatar: req.user.image
            ? config.s3.mainBucketPath + req.user.image
            : config.s3.defaultImagePath,
        }),
      })(req, res, next);
    },

    errorHandler,
  );

  return router;
};
