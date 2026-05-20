import express from 'express';
import * as inboxMw from '@openagenda/inboxes/src/middleware.js';
import makeErrorHandler from './makeErrorHandler.js';

export default (config, services) => {
  const { sessions, users } = services;

  const errorHandler = makeErrorHandler(services);

  const preMw = [
    sessions.mw.ifUnlogged((req, res) =>
      res.status(400).json({
        error: 'Not logged',
      })),
    (req, res, next) => {
      req.type = 'support';
      req.identifier = 1;
      req.creatorInboxUser = {
        userUid: req.user.uid,
      };
      next();
    },
    users.mw.allowSuperAdmin(),
  ];

  const router = express.Router({ mergeParams: true });

  router.get(
    '/conversations/:conversationId/action/:code.json',
    preMw,
    inboxMw.conversations.action({
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'identifier',
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
        identifier: 'identifier',
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
        identifier: 'identifier',
        userUid: null,
      },
      limit: 20,
    }),
    errorHandler,
  );

  router.post(
    '/conversations/:conversationId/messages.json',
    preMw,
    inboxMw.messages.create({
      namespaces: {
        conversationId: 'params.conversationId',
        type: 'type',
        identifier: 'identifier',
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
          identifier: 'identifier',
        },
        limit: req.query.limit || 20,
      })(req, res, next);
    },
    errorHandler,
  );

  router.post(
    '/conversations.json',
    preMw,
    inboxMw.conversations.create({
      namespaces: {
        type: 'type',
        identifier: 'identifier',
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
        identifier: 'identifier',
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
        identifier: 'identifier',
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
        identifier: 'identifier',
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
          identifier: 'identifier',
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
