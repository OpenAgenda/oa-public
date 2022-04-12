'use strict';

const schema = require('@openagenda/validators/schema');
const integerValidator = require('@openagenda/validators/integer');
const textValidator = require('@openagenda/validators/text');

schema.register({
  integer: integerValidator,
  text: textValidator
});

const validate = schema({
  agendaUid: {
    type: 'integer'
  },
  locationUid: {
    type: 'integer',
    list: {
      default: null
    }
  },
  ownerUid: {
    type: 'integer'
  },
  search: {
    type: 'text',
    max: 255
  },
  createdAt: ['gt', 'lt', 'gte', 'lte'].reduce((createdAt, op) => ({
    ...createdAt,
    [op]: { type: 'date' }
  }), {}),
  uid: {
    type: 'integer',
    list: {
      default: null
    }
  }
});

module.exports = (k, query, options = {}) => {
  const {
    agendaUid,
    createdAt,
    locationUid,
    ownerUid,
    search,
    uid
  } = validate(query);

  const {
    private: privateOption,
    draft
  } = options;

  if (agendaUid) {
    k.where('agenda_uid', agendaUid);
  }

  if (locationUid) {
    k.whereIn('location_uid', locationUid);
  }

  if (ownerUid) {
    k.where('owner_uid', ownerUid);
  }

  if (uid) {
    k.whereIn('uid', uid);
  }

  Object.keys(createdAt).forEach(op => {
    if (!createdAt[op]) {
      return;
    }
    k.where('created_at', ({
      gt: '>', gte: '>=', lt: '<', lte: '<='
    })[op], createdAt[op]);
  });

  if (privateOption !== null) {
    k.where('private', privateOption);
  }

  if (draft !== null) {
    k.where('draft', draft);
  }

  if (search) {
    k.where('title', 'like', `%${search}%`);
  }

  if (options.deleted === true) {
    k.whereNotNull('deleted_at');
  } else if (options.deleted === false) {
    k.whereNull('deleted_at');
  }
};
