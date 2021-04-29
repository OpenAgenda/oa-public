'use strict';

const date = require('@openagenda/validators/date');
const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');
const text = require('@openagenda/validators/text');

schema.register({ integer, text, date });

const validate = schema({
  agendaUid: {
    type: 'integer',
  },
  setUid: {
    type: 'integer',
  },
  search: {
    type: 'text',
    max: 255,
  },
  state: {
    type: 'integer',
    default: null,
  },
  updatedAt: ['gt', 'lt', 'gte', 'lte'].reduce((updatedAt, op) => ({
    ...updatedAt,
    [op]: { type: 'date' }
  }), {}),
  uids: {
    type: 'integer',
    list: {
      default: null,
    },
  },
});

module.exports = async (service, k, query) => {
  const {
    agendaUid, setUid, search, state, uids, updatedAt
  } = validate(query);

  const agendaId = agendaUid
    ? await service.interfaces
      .getAgendaDetailsByUid(agendaUid, ['id'])
      .then(r => (r ? r.id : null))
    : null;

  if (agendaId) {
    k.where('agenda_id', agendaId);
  }

  if (setUid) {
    k.where('set_uid', setUid);
  }

  if (search) {
    k.where(function or() {
      this.where('placename', 'like', `%${search}%`)
        .orWhere('address', 'like', `%${search}%`)
        .orWhere('region', 'like', `%${search}%`)
        .orWhere('department', 'like', `%${search}%`)
        .orWhere('city', 'like', `%${search}%`);
    });
  }

  Object.keys(updatedAt)
    .filter(op => !!updatedAt[op])
    .forEach(op => {
      k.where('updated_at', ({
        gt: '>', gte: '>=', lt: '<', lte: '<='
      })[op], updatedAt[op]);
    });

  if (uids) {
    k.whereIn('uid', uids.filter(uid => !!uid));
  }

  if (state !== null) {
    k.where('store', 'like', `%"state":${state}%`);
  }
};
