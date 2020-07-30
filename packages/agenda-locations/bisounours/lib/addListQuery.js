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
  }
});

module.exports = async (service, k, query) => {
  const {
    agendaUid,
    search
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

  return k;
}
