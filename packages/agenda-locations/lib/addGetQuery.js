'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer')
});

const validate = schema({
  agendaUid: {
    type: 'integer'
  },
  setUid: {
    type: 'integer'
  },
  uid: {
    type: 'integer',
    optional: false
  }
});

module.exports = async (service, k, query) => {
  const {
    setUid,
    agendaUid,
    uid
  } = validate(query);

  const agendaId = agendaUid ? await service.interfaces.getAgendaIdByUid(agendaUid) : null;

  if (agendaId) {
    k.where('agenda_id', agendaId);
  }

  if (setUid) {
    k.where('set_uid', setUid);
  }

  k.where('uid', uid);
}
