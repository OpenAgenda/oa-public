import _ from 'lodash';
import VError from '@openagenda/verror';
import parseListArguments from '@openagenda/service-utils/parseListArguments';
import mapper from './utils/mapper';
import messageFieldsMap from './db/messageFieldsMap';
import inboxUserFieldsMap from './db/inboxUserFieldsMap';
import inboxFieldsMap from './db/inboxFieldsMap';
import populateDetails from './db/populateDetails';
import populateAttachments from './db/populateAttachments';

export default class Messages {
  constructor(svc, options) {
    this.svc = svc;
    this.inbox = options.inbox;
    this.userUid = options.userUid; // define if it's in context of a user or not
    this.conversation = options.conversation;
  }

  create(data, options) {
    const { Message } = this.svc;

    return new Message(null, {
      inbox: this.inbox,
      conversation: this.conversation,
      userUid: this.userUid,
    }).create(data, options);
  }

  get(identifiers, options) {
    const { Message } = this.svc;

    return new Message(identifiers, {
      inbox: this.inbox,
      conversation: this.conversation,
      userUid: this.userUid,
    }).get(options);
  }

  addAttachment(identifiers, data) {
    const { Message } = this.svc;

    return new Message(identifiers, {
      inbox: this.inbox,
      conversation: this.conversation,
      userUid: this.userUid,
    }).addAttachment(data);
  }

  async list(...args) {
    const { knex, schemas } = this.svc.config;

    const {
      query, offset, limit, options
    } = parseListArguments(...args);

    if (!query || !query.id) {
      await this._loadConversation();
    }

    let rows;

    const request = knex(schemas.message)
      .select()
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
      .orderBy('created_at', 'desc')
      .offset(offset)
      .limit(limit);

    if (query && query.id) {
      rows = await request.whereIn(
        `${schemas.message}.id`,
        [].concat(query.id)
      );
    } else {
      rows = await request.where('conversation_id', this.conversation.data.id);
    }

    const result = rows.map(row => _.reduce(
      { ...row, ...mapper.toObj(messageFieldsMap, row, options) },
      (accu, value, key) => _.set(accu, key, value),
      {}
    ));

    this.data = await populateDetails(this.svc, result, this.inbox);

    this.data = await populateAttachments(this.svc, result);

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

  toJSON() {
    if (!this.data) {
      return null;
    }

    return this.data;
  }
}
