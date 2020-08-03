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
    search,
    state,
    uids
  } = validate(query);

  const agendaId = agendaUid ? await service.interfaces.getAgendaIdByUid(agendaUid) : null;

  if (agendaId) {
    k.where('agenda_id', agendaId);
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
