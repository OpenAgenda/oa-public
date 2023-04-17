import _ from 'lodash';
import Ajv from 'ajv';
import ajvErrors from 'ajv-errors';
import VError from '@openagenda/verror';
import parseListArguments from '@openagenda/service-utils/parseListArguments';
import mapper from './utils/mapper';
import inboxUserFieldsMap from './db/inboxUserFieldsMap';
import { getListSchema } from './validators/inboxUserSchemas';
import validate from './utils/validate';

const ajv = new Ajv({
  allErrors: true,
  jsonPointers: true,
  errorDataPath: 'property',
});
ajvErrors(ajv);

export default class InboxUsers {
  constructor(svc, options) {
    this.svc = svc;
    this.inbox = options && options.inbox;
  }

  add(data, options) {
    const { InboxUser } = this.svc;

    return new InboxUser(null, { inbox: this.inbox }).create(data, options);
  }

  get(identifiers, options) {
    const { InboxUser } = this.svc;

    return new InboxUser(identifiers, { inbox: this.inbox }).get(options);
  }

  remove(identifiers) {
    const { InboxUser } = this.svc;

    return new InboxUser(identifiers, { inbox: this.inbox }).remove();
  }

  async list(...args) {
    const { knex, schemas } = this.svc.config;

    if (this.inbox) {
      await this._loadInbox();
    }

    const {
      query, offset, limit, options
    } = parseListArguments(...args);

    const data = _.omit(query, ['leftAt']);

    if (this.inbox && this.inbox.data) {
      data.inboxId = this.inbox.data.id;
    }

    validate(ajv, getListSchema(data), data);

    const request = knex(schemas.inboxUser)
      .select()
      .column(
        mapper
          .listFields(inboxUserFieldsMap, 'select', 'db', options, true)
          .map(v => `${schemas.inboxUser}.${v}`)
      )
      .where(
        _.mapKeys(
          mapper.toDb(
            inboxUserFieldsMap,
            'select',
            _.omit(data, 'inboxId'),
            options
          ),
          (v, key) => `${schemas.inboxUser}.${key}`
        )
      )
      .offset(offset)
      .limit(limit);

    if (data.inboxId) {
      request.whereIn(`${schemas.inboxUser}.inbox_id`, [].concat(data.inboxId));
    }

    if (query.leftAt === true) {
      request.whereNotNull(`${schemas.inboxUser}.left_at`);
    } else if (query.leftAt === false) {
      request.whereNull(`${schemas.inboxUser}.left_at`);
    }

    const rows = await request;

    this.data = rows.map(row => _.reduce(
      { ...row, ...mapper.toObj(inboxUserFieldsMap, row, options) },
      (accu, value, key) => _.set(accu, key, value),
      {}
    ));

    return this;
  }

  async _loadInbox() {
    if (!this.inbox.data) {
      await this.inbox.get();
    }

    if (!this.inbox.data) {
      throw new VError('Inbox %j not found', this.inbox.identifiers);
    }
  }

  toJSON() {
    return this.data || null;
  }
}
