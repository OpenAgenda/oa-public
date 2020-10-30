'use strict';

const BadRequestError = require('./BadRequestError');
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
  const cleanQuery = {};

  try {
    Object.assign(cleanQuery, validate(query));
  } catch (e) {
    throw new BadRequestError('Invalid location identifier', e);
  }

  const {
    setUid,
    agendaUid,
    uid
  } = cleanQuery;

  const agendaId = agendaUid ? await service.interfaces
    .getAgendaDetailsByUid(agendaUid, ['id'])
    .then(r => r ? r.id : null) : null;

  if (agendaId) {
    k.where('agenda_id', agendaId);
  }

  if (setUid) {
    k.where('set_uid', setUid);
  }

  k.where('uid', uid);
}
