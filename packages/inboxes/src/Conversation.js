import _ from 'lodash';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import ajvKeywords from 'ajv-keywords';
import uuid from 'uuid/v4';
import VError from '@openagenda/verror';
import logger from '@openagenda/logs';
import mapper from './utils/mapper';
import conversationFieldsMap from './db/conversationFieldsMap';
import inboxUserFieldsMap from './db/inboxUserFieldsMap';
import inboxFieldsMap from './db/inboxFieldsMap';
import validate from './utils/validate';
import {
  identifiersSchema,
  createSchema,
  updateSchema,
} from './validators/conversationSchemas';
import populateDetails from './db/populateDetails';
import populateParticipants from './db/populateParticipants';
import populateLatestMessage from './db/populateLatestMessage';

const log = logger('inboxes/Conversation');

const ajv = new Ajv({
  allErrors: true,
  jsonPointers: true,
  errorDataPath: 'property',
});
ajvErrors(ajv);
ajvKeywords(ajv, ['instanceof']);

export default class Conversation {
  constructor(svc, identifiers, options) {
    const { Messages } = svc;

    this.svc = svc;
    this.identifiers = typeof identifiers === 'object' && identifiers !== null
      ? identifiers
      : { id: identifiers };
    this.inbox = options && options.inbox;
    this.userUid = options && options.userUid;
    this.messages = new Messages({
      conversation: this,
      inbox: this.inbox,
      userUid: this.userUid,
    });
  }

  static async link(svc, { inboxId, conversationId }) {
    const { knex, schemas } = svc.config;

    const link = await knex(schemas.inboxConversation).select().where({
      inbox_id: inboxId,
      conversation_id: conversationId,
    });

    if (link.length) {
      return null;
    }

    return knex(schemas.inboxConversation).insert({
      inbox_id: inboxId,
      conversation_id: conversationId,
    });
  }

  static async unlink(svc, { inboxId, conversationId }) {
    const { knex, schemas } = svc.config;

    return knex(schemas.inboxConversation)
      .where({
        inbox_id: inboxId,
        conversation_id: conversationId,
      })
      .del();
  }

  async create(data, options) {
    const { Inbox } = this.svc;
    const { knex, schemas, types } = this.svc.config;

    const params = _.merge(
      {
        createInboxUserOnNull: false,
      },
      options
    );

    await this._loadInbox();

    const inboxUser = await this._getInboxUser(
      this.userUid ? { userUid: this.userUid } : data.creatorInboxUser,
      { inbox: this.inbox, createOnNull: params.createInboxUserOnNull }
    );

    if (!inboxUser.data) {
      throw new VError('Inbox user %j not found', inboxUser.identifiers);
    }

    const destinationInboxes = await Promise.all(
      [].concat(data.destinationInbox || []).map(v => new Inbox(v).get())
    );
    const destinationNotFound = destinationInboxes.filter(v => !v.data);

    if (destinationNotFound && destinationNotFound.length) {
      throw new VError(
        'Destination Inbox(es) %j not found',
        destinationNotFound
      );
    }

    validate(
      ajv,
      createSchema,
      _.omit(data, 'destinationInbox', 'creatorInboxUser')
    );

    if (!types || !types[data.type]) {
      throw new VError('Unknow conversation type %s', data.type);
    }

    const protectedData = {
      store: { params: data.params || {} },
      ..._.pick(data, 'type', 'typeIdentifier'),
    };

    const finalData = _.omit(
      data,
      'params',
      'destinationInbox',
      'creatorInboxUser'
    );

    const createdAt = new Date();

    const [insertedId] = await knex(schemas.conversation).insert({
      ...mapper.toDb(conversationFieldsMap, 'insert', finalData, options),
      ...mapper.toDb(conversationFieldsMap, 'insert', protectedData, {
        protected: false,
      }),
      creator_inbox_user_id: inboxUser.data.id,
      created_at: createdAt,
      updated_at: createdAt,
      file_key: uuid().replace(/-/g, ''),
    });

    this.identifiers = { id: insertedId };

    log.info('Conversation is created', { conversation: this.identifiers });

    await Conversation.link(this.svc, {
      inboxId: this.inbox.data.id,
      conversationId: this.identifiers.id,
    });

    await Promise.all(
      destinationInboxes.map(async destinationInbox => {
        if (this.inbox.data.id !== destinationInbox.data.id) {
          await Conversation.link(this.svc, {
            inboxId: destinationInbox.data.id,
            conversationId: this.identifiers.id,
          });
        }
      })
    );

    if (data.message) {
      await this.messages.create(
        {
          body: data.message,
          userUid: inboxUser.data.userUid,
        },
        {
          createdAt,
        }
      );
    }

    return this.get(options);
  }

  async get(options) {
    const { knex, schemas } = this.svc.config;

    await this._loadInbox();

    validate(ajv, identifiersSchema, this.identifiers);

    const request = knex(schemas.conversation)
      .first()
      .column(
        mapper
          .listFields(conversationFieldsMap, 'select', 'db', options, true)
          .map(v => `${schemas.conversation}.${v}`)
      )
      .column(`${schemas.inbox}.id as inboxContextId`)
      .column(
        mapper
          .listFields(
            inboxUserFieldsMap,
            'select',
            'db',
            options,
            true,
            'creatorInboxUser.'
          )
          .map(v => `creatorInboxUser.${v}`)
      )
      .column(
        mapper
          .listFields(
            inboxFieldsMap,
            'select',
            'db',
            options,
            true,
            'creatorInbox.'
          )
          .map(v => `creatorInbox.${v}`)
      )
      .max(`${schemas.message}.id as latestMessageId`)
      .leftJoin(
        schemas.inboxConversation,
        `${schemas.inboxConversation}.conversation_id`,
        `${schemas.conversation}.id` // TODO try to add a .on condition with inbox id
      )
      .leftJoin(
        schemas.inbox,
        `${schemas.inbox}.id`,
        `${schemas.inboxConversation}.inbox_id`
      )
      .leftJoin(
        schemas.message,
        `${schemas.message}.conversation_id`,
        `${schemas.conversation}.id`
      )
      .leftJoin(
        `${schemas.inboxUser} as creatorInboxUser`,
        'creatorInboxUser.id',
        `${schemas.conversation}.creator_inbox_user_id`
      )
      .leftJoin(
        `${schemas.inbox} as creatorInbox`,
        'creatorInbox.id',
        'creatorInboxUser.inbox_id'
      )
      .where(
        _.mapKeys(
          mapper.toDb(
            conversationFieldsMap,
            'select',
            this.identifiers,
            options
          ),
          (v, key) => `${schemas.conversation}.${key}`
        )
      )
      .groupBy(`${schemas.conversation}.id`, `${schemas.inbox}.id`)
      .orderByRaw('(closedAt IS NOT NULL)')
      .orderByRaw('latestMessageId DESC')
      .orderByRaw(
        `GREATEST( ${schemas.conversation}.created_at, ${schemas.conversation}.updated_at ) DESC`
      );

    if (this.userUid) {
      // viewed by user endpoint
      request
        .column(
          mapper
            .listFields(
              inboxUserFieldsMap,
              'select',
              'db',
              options,
              true,
              'inboxUser.'
            )
            .map(v => `${schemas.inboxUser}.${v}`)
        )
        .leftJoin(schemas.inboxUser, join => join
          .on(
            `${schemas.inboxUser}.inbox_id`,
            `${schemas.inboxConversation}.inbox_id`
          )
          .onNull(`${schemas.inboxUser}.left_at`))
        .where(`${schemas.inboxUser}.user_uid`, this.userUid)
        .groupBy(`${schemas.inboxUser}.id`);

      if (
        this.inbox.data
        && this.inbox.data.id
        && this.inbox.data.type !== 'user'
      ) {
        request.where(`${schemas.inboxUser}.inbox_id`, this.inbox.data.id);
      }
    } else {
      // viewed by inbox endpoint
      request.where(
        `${schemas.inboxConversation}.inbox_id`,
        this.inbox.data.id
      );
    }

    const row = await request;

    if (!row) {
      this.data = null;
      return this;
    }

    let result = _.reduce(
      { ...row, ...mapper.toObj(conversationFieldsMap, row, options) },
      (accu, value, key) => _.set(accu, key, value),
      {}
    );

    result = await populateDetails(this.svc, result, this.inbox);

    result = await populateLatestMessage(this.svc, result, this.inbox);

    result = await populateParticipants(this.svc, result);

    result.actions = await this.getAvailableActions(result); // TODO fix missing inboxUser

    this.data = result;

    return this;
  }

  async update(data, inboxUser, options) {
    const { knex, schemas } = this.svc.config;

    await this._loadConversation();

    const _inboxUser = await this._getInboxUser(
      this.userUid ? { userUid: this.userUid } : inboxUser,
      { inbox: this.inbox }
    );

    if (!_inboxUser.data) {
      throw new VError('Inbox user %j not found', _inboxUser.identifiers);
    }

    if (data.resolvedAt) {
      data.resolvedAt = new Date(data.resolvedAt);
    }
    if (data.closedAt) {
      data.closedAt = new Date(data.closedAt);
    }

    validate(ajv, updateSchema, data);

    if (data.closedAt === null) {
      data.closedAt = null;
    }

    const finalData = {
      ..._.omit(data, 'params'),
      store: {
        ...this.data.store,
        params: _.merge({}, this.data.store.params || {}, data.params || {}),
      },
    };

    await knex(schemas.conversation)
      .update({
        ...mapper.toDb(conversationFieldsMap, 'update', finalData, options),
        updated_at: new Date(),
      })
      .leftJoin(
        schemas.inboxConversation,
        `${schemas.conversation}.id`,
        `${schemas.inboxConversation}.conversation_id`
      )
      .where(
        _.mapKeys(
          mapper.toDb(
            conversationFieldsMap,
            'select',
            this.identifiers,
            options
          ),
          (v, key) => `${schemas.conversation}.${key}`
        )
      );

    return this.get();
  }

  async action(code, inboxUser) {
    const {
      knex, schemas, interfaces, defaultAction
    } = this.svc.config;

    await this._loadConversation();

    const _inboxUser = await this._getInboxUser(
      this.userUid ? { userUid: this.userUid } : inboxUser,
      { inbox: this.inbox }
    );

    if (!_inboxUser.data) {
      throw new VError('Inbox user %j not found', _inboxUser.identifiers);
    }

    const actions = await this.getAvailableActions(this.data);
    const action = actions.find(v => v && v.code === code);

    if (!action) {
      throw new VError(
        "This action (%s) doesn't exist for a conversation of type %s (%j)",
        code,
        this.data.type,
        this.identifiers
      );
    }

    if (this.data.resolvedAt && code !== defaultAction.code) {
      throw new VError('You cannot resolve a conversation two times');
    }

    const data = (() => {
      if (code === defaultAction.code) {
        return {
          closedAt: new Date(),
          updatedAt: new Date(),
        };
      }
      if (action.resolve === false) {
        return {
          updatedAt: new Date(),
        };
      }
      return {
        closedAt: new Date(),
        updatedAt: new Date(),
        resolvedAt: new Date(),
        store: {
          ...this.data.store,
          resolvedWith: code,
          resolvedBy: {
            inboxUserId: _inboxUser.data.id,
            userUid: _inboxUser.data.userUid,
          },
        },
      };
    })();

    await knex(schemas.conversation)
      .update({
        ...mapper.toDb(conversationFieldsMap, 'update', data, {
          protected: false,
        }),
      })
      .leftJoin(
        schemas.inboxConversation,
        `${schemas.conversation}.id`,
        `${schemas.inboxConversation}.conversation_id`
      )
      .where(
        _.mapKeys(
          mapper.toDb(conversationFieldsMap, 'select', this.identifiers),
          (v, key) => `${schemas.conversation}.${key}`
        )
      );

    try {
      await interfaces.onAction(this.data, action);
    } catch (e) {
      throw new VError(
        {
          cause: e,
          info: { conversation: this, code },
        },
        'Error in onAction interface'
      );
    }

    return this.get();
  }

  async _loadInbox() {
    if (!this.inbox.data) {
      await this.inbox.get();
    }

    if (!this.inbox.data) {
      throw new VError('Inbox %j not found', this.inbox.identifiers);
    }
  }

  async _loadConversation() {
    if (!this.data) {
      await this.get();
    }

    if (!this.data) {
      throw new VError('Conversation %j not found', this.identifiers);
    }
  }

  async _getInboxUser(identifiers, { inbox, createOnNull = false } = {}) {
    const { InboxUser } = this.svc;

    const inboxUser = await new InboxUser(identifiers, { inbox }).get({
      createOnNull,
    });

    if (!inboxUser.data) {
      throw new VError(
        'InboxUser %j not found in Inbox %j',
        identifiers,
        this.inbox.identifiers
      );
    }

    return inboxUser;
  }

  async getAvailableActions(conversation) {
    const { Inbox } = this.svc;
    const { interfaces, defaultAction, types } = this.svc.config;

    const inbox = this.inbox.data.id === conversation.inboxContextId
      ? this.inbox
      : await new Inbox(conversation.inboxContextId).get();

    const actions = conversation.closedAt || conversation.resolvedAt
      ? []
      : await _.get(types, [conversation.type, 'actions'], []).reduce(
        async (result, action) => {
          const keep = await interfaces.filterAction(
            inbox.data,
            conversation,
            action
          );

          if (!keep) {
            return result;
          }

          return [...(await result), action];
        },
        []
      );

    if (
      !actions.filter(v => v.resolve !== false).length
      && !conversation.closedAt
    ) {
      return [...actions, defaultAction];
    }

    return actions;
  }

  toJSON() {
    if (!this.data) {
      return null;
    }

    return this.data;
  }
}
