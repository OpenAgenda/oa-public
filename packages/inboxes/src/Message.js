import _ from 'lodash';
import VError from '@openagenda/verror';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import logger from '@openagenda/logs';
import mapper from './utils/mapper';
import messageFieldsMap from './db/messageFieldsMap';
import inboxUserFieldsMap from './db/inboxUserFieldsMap';
import inboxFieldsMap from './db/inboxFieldsMap';
import validate from './utils/validate';
import { identifiersSchema, createSchema } from './validators/messageSchemas';
import populateDetails from './db/populateDetails';
import populateAttachments from './db/populateAttachments';

const log = logger('conversation/Message');

const ajv = new Ajv({
  allErrors: true,
  jsonPointers: true,
  errorDataPath: 'property',
});
ajvErrors(ajv);

export default class Message {
  constructor(svc, identifiers, options) {
    this.svc = svc;
    this.identifiers = typeof identifiers === 'object' && identifiers !== null
      ? identifiers
      : { id: identifiers };
    this.inbox = options.inbox;
    this.conversation = options.conversation;
    this.userUid = options && options.userUid;
  }

  async create(data, options) {
    const { knex, schemas, interfaces } = this.svc.config;

    const params = _.merge(
      {
        createInboxUserOnNull: false,
        createdAt: null,
      },
      options
    );

    await this._loadConversation();
    const inboxUser = this.conversation.data.inboxUser
      || (
        await this._getInboxUser(
          { userUid: this.userUid || data.userUid },
          { createOnNull: params.createInboxUserOnNull }
        )
      ).data;

    const finalData = {
      ..._.pick(data, 'body'),
      conversationId: this.conversation.data.id,
      inboxUserId: inboxUser.id,
    };

    validate(ajv, createSchema, finalData);

    const createdAt = params.createdAt || new Date();

    const [insertedId] = await knex(schemas.message).insert({
      ...mapper.toDb(messageFieldsMap, 'insert', finalData, {
        protected: false,
      }),
      created_at: createdAt,
    });

    this.identifiers = { id: insertedId };

    await this.conversation.update({ updatedAt: createdAt }, inboxUser.id, {
      protected: false,
    });

    await this.get(options);

    log.info(
      'Message is created in conversation %d',
      this.conversation.data.id,
      { msg: this.data, inboxUser }
    );

    if (interfaces.onMessageCreate) {
      await interfaces.onMessageCreate(this.conversation.data, this.data);
    }

    return this;
  }

  async get(options) {
    const { knex, schemas } = this.svc.config;

    await this._loadConversation();

    if (!options || !options.latest) {
      validate(ajv, identifiersSchema, this.identifiers);
    }

    const request = knex(schemas.message)
      .first()
      .column(
        mapper
          .listFields(messageFieldsMap, 'select', 'db', options, true)
          .map(v => `${schemas.message}.${v}`)
      )
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
      .column(
        mapper
          .listFields(inboxFieldsMap, 'select', 'db', options, true, 'inbox.')
          .map(v => `${schemas.inbox}.${v}`)
      )
      .leftJoin(
        schemas.inboxUser,
        `${schemas.inboxUser}.id`,
        `${schemas.message}.inbox_user_id`
      )
      .leftJoin(
        schemas.inbox,
        `${schemas.inbox}.id`,
        `${schemas.inboxUser}.inbox_id`
      )
      .where(
        _.mapKeys(
          mapper.toDb(messageFieldsMap, 'select', this.identifiers, options),
          (v, key) => `${schemas.message}.${key}`
        )
      );

    if (options && options.latest) {
      request
        .where(`${schemas.message}.conversation_id`, this.conversation.data.id)
        .orderBy('created_at', 'desc');
    }

    const row = await request;

    const result = _.reduce(
      { ...row, ...mapper.toObj(messageFieldsMap, row, options) },
      (accu, value, key) => _.set(accu, key, value),
      row ? {} : null
    );

    this.data = await populateDetails(this.svc, result, this.inbox);

    this.data = await populateAttachments(this.svc, result);

    return this;
  }

  async addAttachment(data) {
    const { knex, schemas } = this.svc.config;

    await this.get();

    if (!this.data) {
      throw new VError('Message cannot found');
    }

    /*
     * originalName  // original name
     * filename      // s3 filename on bucket
     * */

    const inboxUser = this.conversation.data.inboxUser
      || (await this._getInboxUser({ userUid: this.userUid })).data;

    await knex(schemas.messageAttachment).insert({
      message_id: this.data.id,
      inbox_user_id: inboxUser.id,
      original_name: data.originalName,
      filename: data.filename,
      created_at: new Date(),
    });

    return this;
  }

  async _loadConversation() {
    if (!this.conversation.data) {
      await this.conversation.get();
    }

    if (!this.conversation.data) {
      throw new VError(
        'Conversation %j not found',
        this.conversation.identifiers
      );
    }
  }

  async _getInboxUser(identifiers, options) {
    const inboxUser = await this.inbox.users.get(identifiers, options);
    // const inboxUser = await new InboxUser( identifiers, { inbox } ).get( { createOnNull } );

    if (!inboxUser.data) {
      throw new VError(
        'InboxUser %j not found in Inbox %j',
        identifiers,
        this.inbox.identifiers
      );
    }

    return inboxUser;
  }

  toJSON() {
    if (!this.data) {
      return null;
    }

    return this.data;
  }
}
