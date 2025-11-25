import { Readable } from 'node:stream';
import _ from 'lodash';
import ky from 'ky';
import mime from 'mime-types';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import Inbox from './Inbox.js';
import Conversations from './Conversations.js';

const log = logs('inboxes/middleware');

let svc;

export function init(service) {
  svc = service;
}

function wrap(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

function getLimit(max, limit) {
  const limitInt = parseInt(limit, 10);

  if (!limitInt) {
    return max;
  }

  return limitInt > max ? max : limitInt;
}

/* User enpoints */

export function user(namespace) {
  return {
    conversations: {
      list(options) {
        const { namespaces, ...params } = _.merge(
          {
            namespaces: {
              query: {
                typeIdentifier: 'query.typeIdentifier',
                type: 'query.type',
              },
              total: 'query.total',
            },
            limit: 20,
          },
          options,
        );

        return wrap(async (req, res) => {
          const query = _.pickBy({
            type: _.get(req, namespaces.query.type),
            typeIdentifier: parseInt(
              _.get(req, namespaces.query.typeIdentifier),
              10,
            ),
          });
          const limit = getLimit(svc.config.mw.limit, params.limit);
          const total = _.get(req, namespaces.total, false);

          const conversations = await Inbox.user(
            svc,
            _.get(req, namespace),
          ).conversations.list(
            query,
            (req.query.page > 0 ? req.query.page - 1 : 0) * limit,
            limit,
            { total },
          );

          res.send({
            conversations: conversations.data || null,
            total: conversations.total || null,
            totalOpened: conversations.totalOpened || null,
            totalClosed: conversations.totalClosed || null,
          });
        });
      },
    },
  };
}

/* Other enpoints */

export const inboxUser = {
  get(options) {
    const { namespaces, fallbackGetter } = _.merge(
      {
        namespaces: {
          type: 'type',
          identifier: 'identifier',
          userUid: 'user.uid',
        },
        fallbackGetter: null,
      },
      options,
    );

    return wrap(async (req, res) => {
      const inboxIdentifiers = {
        type: _.get(req, namespaces.type),
        identifier: parseInt(_.get(req, namespaces.identifier), 10),
      };
      const userUid = parseInt(_.get(req, namespaces.userUid), 10);

      let inbox = await new Inbox(svc, inboxIdentifiers);
      let inboxUserEntity = await inbox.users.get({ userUid });

      if (inboxUserEntity && inboxUserEntity.data) {
        inboxUserEntity = {
          ...inboxUserEntity.toJSON(),
          ...(
            await svc.config.interfaces.getUsersDetails([inboxUserEntity.data])
          )[0],
        };
      } else if (fallbackGetter) {
        inboxUserEntity = await fallbackGetter({
          req,
          inbox: inbox.data,
          userUid,
        });
      }

      inbox = {
        ...inbox.toJSON(),
        ...(await svc.config.interfaces.getInboxesDetails([inbox.data]))[0],
      };

      res.send({ inbox, inboxUser: inboxUserEntity });
    });
  },
};

export const conversations = {
  create(options) {
    const { namespaces } = _.merge(
      {
        namespaces: {
          type: 'type',
          identifier: 'identifier',
          destinationInbox: 'destinationInbox',
          conversationType: 'conversationType',
          conversationTypeIdentifier: 'conversationTypeIdentifier',
          params: 'conversationParams',
          message: 'body.message',
          creatorInboxUser: 'creatorInboxUser',
          options: 'options',
          userUid: 'user.uid',
        },
      },
      options,
    );

    return wrap(async (req, res) => {
      const data = {
        destinationInbox: _.get(req, namespaces.destinationInbox),
        type: _.get(req, namespaces.conversationType),
        params: _.get(req, namespaces.params),
        creatorInboxUser: _.get(req, namespaces.creatorInboxUser),
        message: _.get(req, namespaces.message),
      };

      const inboxIdentifiers = {
        type: _.get(req, namespaces.type),
        identifier: parseInt(_.get(req, namespaces.identifier), 10),
      };

      const optionalData = _.pickBy({
        typeIdentifier: _.get(req, namespaces.conversationTypeIdentifier),
      });

      const creatingInbox = await new Inbox(svc, inboxIdentifiers);

      log('inbox creating conversation', {
        id: creatingInbox?.id,
        inboxIdentifiers,
      });

      const conversationEntities = await new Conversations(svc, {
        userUid: parseInt(_.get(req, namespaces.userUid), 10),
        inbox: creatingInbox,
      });

      log('conversation create data', {
        ...data,
        ...optionalData,
      });

      const conversation = await conversationEntities.create(
        {
          ...data,
          ...optionalData,
        },
        _.get(req, namespaces.options),
      );

      res.send({ conversation });
    });
  },

  list(options) {
    const { namespaces, ...params } = _.merge(
      {
        namespaces: {
          type: 'type',
          identifier: 'identifier',
          query: {
            typeIdentifier: 'query.typeIdentifier',
            type: 'query.type',
          },
          total: 'query.total',
        },
        limit: 20,
      },
      options,
    );

    return wrap(async (req, res) => {
      const query = _.pickBy({
        type: _.get(req, namespaces.query.type),
        typeIdentifier: parseInt(
          _.get(req, namespaces.query.typeIdentifier),
          10,
        ),
      });
      const limit = getLimit(svc.config.mw.limit, params.limit);
      const total = _.get(req, namespaces.total, false);

      const conversationEntities = await new Inbox(svc, {
        type: _.get(req, namespaces.type),
        identifier: parseInt(_.get(req, namespaces.identifier), 10),
      }).conversations.list(
        query,
        (req.query.page > 0 ? req.query.page - 1 : 0) * limit,
        limit,
        { total },
      );

      res.send({
        conversations: conversationEntities.data || null,
        total: conversationEntities.total || null,
        totalOpened: conversationEntities.totalOpened || null,
        totalClosed: conversationEntities.totalClosed || null,
      });
    });
  },
  /* options */
  action(options) {
    const { namespaces } = _.merge(
      {
        namespaces: {
          type: 'type',
          identifier: 'identifier',
          conversationId: 'conversation.id',
          userUid: 'user.uid',
          code: 'code',
        },
      },
      options,
    );

    return wrap(async (req, res) => {
      try {
        const conversation = await new Conversations(svc, {
          userUid: parseInt(_.get(req, namespaces.userUid), 10),
          inbox: new Inbox(svc, {
            type: _.get(req, namespaces.type),
            identifier: parseInt(_.get(req, namespaces.identifier), 10),
          }),
        }).get(parseInt(_.get(req, namespaces.conversationId), 10));

        await conversation.action(_.get(req, namespaces.code), {
          userUid: parseInt(_.get(req, namespaces.userUid), 10),
        });

        return res.send({ conversation });
      } catch (e) {
        if (e.message === 'You cannot resolve a conversation two times') {
          return res.status(403).send(e);
        }
      }
    });
  },

  resume(options) {
    const { namespaces } = _.merge(
      {
        namespaces: {
          type: 'type',
          identifier: 'identifier',
          conversationId: 'conversation.id',
          userUid: 'user.uid',
        },
      },
      options,
    );

    return wrap(async (req, res) => {
      const conversation = await new Conversations(svc, {
        userUid: parseInt(_.get(req, namespaces.userUid), 10),
        inbox: new Inbox(svc, {
          type: _.get(req, namespaces.type),
          identifier: parseInt(_.get(req, namespaces.identifier), 10),
        }),
      }).get(parseInt(_.get(req, namespaces.conversationId), 10));

      await conversation.update(
        { closedAt: null },
        { userUid: _.get(req, namespaces.userUid) },
      );

      res.send({ conversation });
    });
  },
};

export const messages = {
  list(options) {
    const { namespaces, ...params } = _.merge(
      {
        namespaces: {
          type: 'type',
          identifier: 'identifier',
          conversationId: 'conversation.id',
          userUid: 'user.uid',
        },
        limit: 20,
      },
      options,
    );

    return wrap(async (req, res) => {
      const limit = getLimit(svc.config.mw.limit, params.limit);

      const conversation = await new Conversations(svc, {
        userUid: parseInt(_.get(req, namespaces.userUid), 10),
        inbox: new Inbox(svc, {
          type: _.get(req, namespaces.type),
          identifier: parseInt(_.get(req, namespaces.identifier), 10),
        }),
      }).get(parseInt(_.get(req, namespaces.conversationId), 10));

      const messageEntities = await conversation.messages.list(
        (req.query.page > 0 ? req.query.page - 1 : 0) * limit,
        limit /* options */,
      );

      res.send({ conversation, messages: messageEntities });
    });
  },

  create(options) {
    const { namespaces } = _.merge(
      {
        namespaces: {
          type: 'type',
          identifier: 'identifier',
          conversationId: 'conversation.id',
          userUid: 'user.uid',
          body: 'body.body',
          options: 'options',
        },
      },
      options,
    );

    return wrap(async (req, res) => {
      const conversation = await new Conversations(svc, {
        userUid: parseInt(_.get(req, namespaces.userUid), 10),
        inbox: new Inbox(svc, {
          type: _.get(req, namespaces.type),
          identifier: parseInt(_.get(req, namespaces.identifier), 10),
        }),
      }).get(parseInt(_.get(req, namespaces.conversationId), 10));

      const message = await conversation.messages.create(
        {
          body: _.get(req, namespaces.body),
          userUid: _.get(req, namespaces.userUid),
        },
        _.get(req, namespaces.options),
      );

      res.send({ message });
    });
  },

  prepareAttachment(options) {
    const { namespaces } = _.merge(
      {
        namespaces: {
          type: 'type',
          identifier: 'identifier',
          conversationId: 'conversation.id',
          messageId: 'message.id',
          userUid: 'user.uid',
          index: 'query.index',
        },
      },
      options,
    );

    const { app: companionApp } = svc.config.uppyCompanion;

    return wrap(async (req, res) => {
      const messageId = parseInt(_.get(req, namespaces.messageId), 10);
      const index = parseInt(_.get(req, namespaces.index, 0), 10);

      const conversation = await new Conversations(svc, {
        userUid: parseInt(_.get(req, namespaces.userUid), 10),
        inbox: new Inbox(svc, {
          type: _.get(req, namespaces.type),
          identifier: parseInt(_.get(req, namespaces.identifier), 10),
        }),
      }).get(parseInt(_.get(req, namespaces.conversationId), 10));

      const message = await conversation.messages.get(messageId);

      if (!message || !message.data) {
        res.status(400);
        throw new VError("Message doesn't exist");
      }

      const { filename: originalName } = req.query;
      const conversationFileKey = conversation.data.fileKey;
      const extension = originalName.split('.').pop();

      const foreignFilename = `conv.${conversationFileKey}.msg.${messageId}-${index}${
        extension ? `.${extension}` : ''
      }`;

      req.filename = foreignFilename;

      companionApp(req, res);
    });
  },

  uploadAttachment(options) {
    const { files, namespaces } = _.merge(
      {
        namespaces: {
          type: 'type',
          identifier: 'identifier',
          conversationId: 'conversation.id',
          messageId: 'message.id',
          userUid: 'user.uid',
          index: 'body.index',
        },
      },
      options,
    );

    const upload = files({
      key: 'file',
      getFilename: (info, context) => context.foreignFilename,
    });

    return [
      upload.cleanup(),
      upload.multer.single('file'),
      wrap(async (req, res) => {
        const messageId = parseInt(_.get(req, namespaces.messageId), 10);
        const index = parseInt(_.get(req, namespaces.index, 0), 10);

        const conversation = await new Conversations(svc, {
          userUid: parseInt(_.get(req, namespaces.userUid), 10),
          inbox: new Inbox(svc, {
            type: _.get(req, namespaces.type),
            identifier: parseInt(_.get(req, namespaces.identifier), 10),
          }),
        }).get(parseInt(_.get(req, namespaces.conversationId), 10));

        const message = await conversation.messages.get(messageId);

        if (!message || !message.data) {
          res.status(400);
          throw new VError("Message doesn't exist");
        }

        const { name: originalName } = req.body;
        const conversationFileKey = conversation.data.fileKey;
        const extension = originalName.split('.').pop();

        const foreignFilename = `conv.${conversationFileKey}.msg.${messageId}-${index}${
          extension ? `.${extension}` : ''
        }`;

        const result = await req.file.transformAndUpload({ foreignFilename });

        await message.addAttachment({
          originalName,
          filename: result.filename,
        });

        const attachment = await svc.config
          .knex(svc.config.schemas.messageAttachment)
          .select()
          .first()
          .where({
            message_id: message.data.id,
            filename: result.filename,
          })
          .then((v) => _.mapKeys(v, (value, key) => _.camelCase(key)));

        res.send(attachment);
      }),
    ];
  },

  addAttachment(options) {
    const { namespaces } = _.merge(
      {
        namespaces: {
          type: 'type',
          identifier: 'identifier',
          conversationId: 'conversation.id',
          messageId: 'message.id',
          userUid: 'user.uid',
          filename: 'filename',
          originalName: 'originalName',
        },
      },
      options,
    );

    return wrap(async (req, res) => {
      const messageId = parseInt(_.get(req, namespaces.messageId), 10);

      const conversation = await new Conversations(svc, {
        userUid: parseInt(_.get(req, namespaces.userUid), 10),
        inbox: new Inbox(svc, {
          type: _.get(req, namespaces.type),
          identifier: parseInt(_.get(req, namespaces.identifier), 10),
        }),
      }).get(parseInt(_.get(req, namespaces.conversationId), 10));

      const message = await conversation.messages.get(messageId);

      if (!message || !message.data) {
        res.status(400);
        throw new VError("Message doesn't exist");
      }

      const originalName = _.get(req, namespaces.originalName);
      const filename = _.get(req, namespaces.filename);

      await conversation.messages.addAttachment(messageId, {
        originalName,
        filename,
      });

      res.send({ message: await message.get() });
    });
  },

  downloadAttachment(options) {
    const { namespaces } = _.merge(
      {
        namespaces: {
          id: 'attachment.id',
          filename: 'attachment.filename',
        },
      },
      options,
    );

    return wrap(async (req, res, next) => {
      const filename = _.get(req, namespaces.filename, null);

      const attachment = await svc.config
        .knex(svc.config.schemas.messageAttachment)
        .select()
        .first()
        .where({
          id: parseInt(_.get(req, namespaces.id, null), 10),
          filename,
        })
        .then((v) => _.mapKeys(v, (value, key) => _.camelCase(key)));

      try {
        const response = await ky.get(
          `https://cdn.openagenda.com/${svc.config.s3.bucket}/${filename}`,
          {
            throwHttpErrors: false,
          },
        );

        if (!response.ok) {
          throw new VError(
            { info: { status: response.status } },
            `Download failed with status ${response.status}`,
          );
        }

        const contentType = response.headers.get('content-type')
          || mime.contentType(filename)
          || 'application/octet-stream';

        res.set('Content-Type', contentType);

        res.set(
          'Content-Disposition',
          /\.(jpeg|jpg|gif|png|svg|bmp)$/i.test(filename)
            ? 'inline'
            : `attachment; filename="${
              attachment ? attachment.originalName : filename
            }"`,
        );

        const nodeStream = Readable.fromWeb(response.body);
        nodeStream.on('error', (err) => res.destroy(err));
        nodeStream.pipe(res);
      } catch (error) {
        res.status(403);
        next(new VError(error, 'Cannot download the attachment'));
      }
    });
  },
};
