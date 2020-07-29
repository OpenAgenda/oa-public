'use strict';

const schema = require('@openagenda/validators/schema');

schema.register({
  integer: require('@openagenda/validators/integer')
});

const validate = schema({
  agendaUid: {
    type: 'integer'
  }
});

module.exports = async (service, k, query) => {
  const {
    agendaUid
  } = validate(query);

  const agendaId = agendaUid ? await service.interfaces.getAgendaIdByUid(agendaUid) : null;

  if (agendaId) {
    k.where('agenda_id', agendaId);
  }

  return k;
}
