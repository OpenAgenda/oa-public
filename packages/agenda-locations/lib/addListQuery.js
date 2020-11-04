'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer'),
  text: require('@openagenda/validators/text')
});

const validate = schema({
  agendaUid: {
    type: 'integer'
  },
  setUid: {
    type: 'integer'
  },
  search: {
    type: 'text',
    max: 255
  },
  state: {
    type: 'integer',
    default: null
  },
  uids: {
    type: 'integer',
    list: {
      default: null
    }
  }
});

module.exports = async (service, k, query) => {
  const {
    agendaUid,
    setUid,
    search,
    state,
    uids
  } = validate(query);

  const agendaId = agendaUid ? await service.interfaces
    .getAgendaDetailsByUid(agendaUid, ['id'])
    .then(r => r ? r.id : null) : null;

  if (agendaId) {
    k.where('agenda_id', agendaId);
  }

  if (setUid) {
    k.where('set_uid', setUid);
  }

  if (search) {
    k.where(function() {
      this.where('placename', 'like', '%' + search + '%')
        .orWhere('address', 'like', '%' + search + '%')
        .orWhere('region', 'like', '%' + search + '%')
        .orWhere('department', 'like', '%' + search + '%')
        .orWhere('city', 'like', '%' + search + '%');
    });
  }

  if (uids) {
    k.whereIn('uid', uids);
  }

  if (state !== null) {
    k.where('store', 'like', `%"state":${state}%`);
  }
}
