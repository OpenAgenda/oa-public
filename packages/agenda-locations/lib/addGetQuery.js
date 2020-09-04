'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer')
});

const validate = schema({
  agendaUid: {
    type: 'integer'
  },
  uid: {
    type: 'integer',
    optional: false
  }
});

module.exports = async (service, k, query) => {
  const {
    agendaUid,
    uid
  } = validate(query);

  const agendaId = agendaUid ? await service.interfaces.getAgendaIdByUid(agendaUid) : null;

  if (agendaId) {
    k.where('agenda_id', agendaId);
  }

  k.where('uid', uid);
}
