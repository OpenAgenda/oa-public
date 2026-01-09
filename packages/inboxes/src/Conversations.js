import _ from 'lodash';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import ajvKeywords from 'ajv-keywords';
import { NotFound } from '@openagenda/verror';
import parseListArguments from '@openagenda/service-utils/parseListArguments.js';
import mapper from './utils/mapper.js';
import validate from './utils/validate.js';
import conversationFieldsMap from './db/conversationFieldsMap.js';
import inboxUserFieldsMap from './db/inboxUserFieldsMap.js';
import inboxFieldsMap from './db/inboxFieldsMap.js';
import populateParticipants from './db/populateParticipants.js';
import populateLatestMessage from './db/populateLatestMessage.js';
import populateDetails from './db/populateDetails.js';
import { listSchema } from './validators/conversationSchemas.js';

const ajv = new Ajv({
  allErrors: true,
  jsonPointers: true,
  errorDataPath: 'property',
});
ajvErrors(ajv);
ajvKeywords(ajv, ['instanceof']);

export default class Conversations {
  constructor(svc, options) {
    this.svc = svc;
    this.inbox = options.inbox;
    this.userUid = options.userUid; // define if it's in context of a user or not
  }

  create(data, options) {
    const { Conversation } = this.svc;

    return new Conversation(null, {
      inbox: this.inbox,
      userUid: this.userUid,
    }).create(data, options);
  }

  get(identifiers, options) {
    const { Conversation } = this.svc;

    return new Conversation(identifiers, {
      inbox: this.inbox,
      userUid: this.userUid,
    }).get(options);
  }

  update(identifiers, data, inboxUser, options) {
    const { Conversation } = this.svc;

    return new Conversation(identifiers, {
      inbox: this.inbox,
      userUid: this.userUid,
    }).update(data, inboxUser, options);
  }

  action(identifiers, code, inboxUser) {
    const { Conversation } = this.svc;

    return new Conversation(identifiers, {
      inbox: this.inbox,
      userUid: this.userUid,
    }).action(code, inboxUser);
  }

  async list(...args) {
    const { knex, schemas } = this.svc.config;

    await this._loadInbox();

    const { query, offset, limit, options } = parseListArguments(...args);

    const params = _.assign(
      {
        total: false,
      },
      options,
    );

    validate(ajv, listSchema, query);

    const pick = this.userUid
      ? knex
        .select(`${schemas.inboxConversation}.conversation_id`)
        .min({ inbox_id: `${schemas.inboxConversation}.inbox_id` })
        .from(schemas.inboxConversation)
        .join(schemas.inboxUser, function () {
          this.on(
            `${schemas.inboxUser}.inbox_id`,
            `${schemas.inboxConversation}.inbox_id`,
          ).onNull(`${schemas.inboxUser}.left_at`);
        })
        .where(`${schemas.inboxUser}.user_uid`, this.userUid)
        .groupBy(`${schemas.inboxConversation}.conversation_id`)
        .as('pick')
      : knex
        .select(`${schemas.inboxConversation}.conversation_id`)
        .select({ inbox_id: `${schemas.inboxConversation}.inbox_id` })
        .from(schemas.inboxConversation)
        .where(`${schemas.inboxConversation}.inbox_id`, this.inbox.data.id)
        .as('pick');

    const request = knex(schemas.conversation)
      .select()
      .column(
        mapper
          .listFields(conversationFieldsMap, 'select', 'db', options, true)
          .map((v) => `${schemas.conversation}.${v}`),
      )
      .select(knex.raw('?? AS ??', ['pick.inbox_id', 'inboxContextId']))
      .column(
        mapper
          .listFields(
            inboxUserFieldsMap,
            'select',
            'db',
            options,
            true,
            'creatorInboxUser.',
          )
          .map((v) => `creatorInboxUser.${v}`),
      )
      .column(
        mapper
          .listFields(
            inboxFieldsMap,
            'select',
            'db',
            options,
            true,
            'creatorInbox.',
          )
          .map((v) => `creatorInbox.${v}`),
      )
      .max(`${schemas.message}.id as latestMessageId`)
      .join(pick, 'pick.conversation_id', `${schemas.conversation}.id`)
      .join(`${schemas.inbox} as ctxInbox`, 'ctxInbox.id', 'pick.inbox_id')
      .leftJoin(
        schemas.message,
        `${schemas.message}.conversation_id`,
        `${schemas.conversation}.id`,
      )
      .leftJoin(
        `${schemas.inboxUser} as creatorInboxUser`,
        'creatorInboxUser.id',
        `${schemas.conversation}.creator_inbox_user_id`,
      )
      .leftJoin(
        `${schemas.inbox} as creatorInbox`,
        'creatorInbox.id',
        'creatorInboxUser.inbox_id',
      )
      .where(
        _.mapKeys(
          mapper.toDb(conversationFieldsMap, 'select', query, options),
          (v, key) => `${schemas.conversation}.${key}`,
        ),
      )
      .havingNotNull('latestMessageId')
      .groupBy(`${schemas.conversation}.id`)
      .orderByRaw('(closedAt IS NOT NULL)')
      .orderByRaw('latestMessageId DESC')
      .orderByRaw(
        `GREATEST( ${schemas.conversation}.created_at, ${schemas.conversation}.updated_at ) DESC`,
      );

    if (this.userUid) {
      // viewed by user endpoint
      const iuPick = knex
        .select({ inbox_id: `${schemas.inboxUser}.inbox_id` })
        .min({ id: `${schemas.inboxUser}.id` })
        .from(schemas.inboxUser)
        .whereNull(`${schemas.inboxUser}.left_at`)
        .where(`${schemas.inboxUser}.user_uid`, this.userUid)
        .groupBy(`${schemas.inboxUser}.inbox_id`)
        .as('iuPick');

      request
        .join(iuPick, 'iuPick.inbox_id', 'pick.inbox_id')
        .join(`${schemas.inboxUser} as inboxUser`, 'inboxUser.id', 'iuPick.id')
        .column(
          mapper
            .listFields(
              inboxUserFieldsMap,
              'select',
              'db',
              options,
              true,
              'inboxUser.',
            )
            .map((v) => `inboxUser.${v}`),
        )
        .groupBy(
          'inboxUser.id',
          'inboxUser.inbox_id',
          'inboxUser.user_uid',
          'inboxUser.left_at',
        );
    }

    if (params.total) {
      const countResult = await knex
        .count('cnt.id AS total')
        .first()
        .from(request.clone().as('cnt'));
      const countOpenedResult = await knex
        .count('cnt.id AS total')
        .whereNull('closedAt')
        .first()
        .from(request.clone().as('cnt'));
      this.total = countResult.total || 0;
      this.totalOpened = countOpenedResult.total || 0;
      this.totalClosed = countResult.total - countOpenedResult.total;
    } else {
      this.total = null;
    }

    let result = await request
      .offset(offset)
      .limit(limit)
      .then((rows) =>
        rows.map((row) =>
          _.reduce(
            { ...row, ...mapper.toObj(conversationFieldsMap, row, options) },
            (accu, value, key) => _.set(accu, key, value),
            {},
          )));

    result = await populateDetails(this.svc, result, this.inbox);

    result = await populateLatestMessage(this.svc, result, this.inbox);

    result = await populateParticipants(this.svc, result);

    this.data = result;

    return this;
  }

  async _loadInbox() {
    if (!this.inbox.data) {
      await this.inbox.get();
    }

    if (!this.inbox.data) {
      throw new NotFound('Inbox %j not found', this.inbox.identifiers);
    }
  }

  toJSON() {
    if (typeof this.total === 'number') {
      return {
        total: this.total,
        totalOpened: this.totalOpened,
        totalClosed: this.totalClosed,
        data: this.data || null,
      };
    }

    return this.data || null;
  }
}
