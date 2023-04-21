import _ from 'lodash';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import VError from '@openagenda/verror';
import logger from '@openagenda/logs';
import mapper from './utils/mapper';
import fieldsMap from './db/inboxFieldsMap';
import validate from './utils/validate';
import { getIdentifiersSchema, createSchema } from './validators/inboxSchemas';

const log = logger('inboxes/Inbox');

const ajv = new Ajv({
  allErrors: true,
  jsonPointers: true,
  errorDataPath: 'property',
});
ajvErrors(ajv);

export default class Inbox {
  constructor(svc, identifiers) {
    const { InboxUsers, Conversations } = svc;

    this.svc = svc;
    this.identifiers = typeof identifiers === 'object' && identifiers !== null
      ? identifiers
      : { id: identifiers };
    this.users = new InboxUsers({ inbox: this });
    this.conversations = new Conversations({ inbox: this });
  }

  static user(svc, userUid) {
    const { Conversations } = svc;

    return {
      conversations: new Conversations({
        userUid,
        inbox: new Inbox(svc, { type: 'user', identifier: userUid }),
      }),
    };
  }

  async create(data, options) {
    const { knex, schemas, interfaces } = this.svc.config;

    validate(ajv, createSchema, data);

    const inbox = await new Inbox(this.svc, data)._get(options);
    if (inbox.data) {
      return inbox;
    }

    const [insertedId] = await knex(schemas.inbox).insert(
      mapper.toDb(fieldsMap, 'insert', data, { protected: false })
    );

    this.identifiers = { id: insertedId };

    await this.get(options);

    log.info('Inbox is created', { inbox: this.data });

    if (interfaces.onInboxCreate) {
      await interfaces.onInboxCreate(this);
    }

    return this;
  }

  async get(options) {
    const params = _.merge({ createOnNull: true }, options);

    await this._get(params);

    if (!this.data && this.identifiers.type && params.createOnNull) {
      return this.create(this.identifiers, params);
    }

    return this;
  }

  async remove() {
    const { knex, schemas } = this.svc.config;

    await this.get();

    if (!this.data) {
      throw new VError(
        'You can not remove a inbox that does not exists: %j',
        this.identifiers
      );
    }

    await knex(schemas.inbox).where('id', this.data.id);

    log.info('Inbox removed', { inbox: this.data });

    this.data = null;

    return this;
  }

  async _get(options) {
    const { knex, schemas } = this.svc.config;

    validate(ajv, getIdentifiersSchema(this.identifiers), this.identifiers);

    const data = await knex(schemas.inbox)
      .first(mapper.listFields(fieldsMap, 'select', 'db', options))
      .where(mapper.toDb(fieldsMap, 'select', this.identifiers, options));

    this.data = mapper.toObj(fieldsMap, data, options);

    return this;
  }

  toJSON() {
    if (!this.data) {
      return null;
    }

    return _.pick(this.data, mapper.listFields(fieldsMap, 'select', 'obj'));
  }
}
