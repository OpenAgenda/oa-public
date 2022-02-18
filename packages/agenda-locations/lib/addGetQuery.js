'use strict';

const schema = require('@openagenda/validators/schema');
const integer = require('@openagenda/validators/integer');

schema.register({ integer });

const { BadRequest } = require('@openagenda/verror');

const validate = schema({
  agendaUid: {
    type: 'integer',
  },
  setUid: {
    type: 'integer',
  },
  extId: {
    type: 'text',
  },
  uid: {
    type: 'integer',
  },
});

module.exports = async (service, k, deleted, query) => {
  const cleanQuery = {};

  try {
    Object.assign(cleanQuery, validate(query));
    if (!cleanQuery.uid && !cleanQuery.extId) {
      throw new Error('identifier is missing');
    }
  } catch (e) {
    throw new BadRequest('Invalid location identifier', e);
  }

  const {
    setUid, agendaUid, uid, extId
  } = cleanQuery;

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

  if (extId) {
    k.where('ext_id', extId);
  } else {
    k.where('uid', uid);
  }

  if (deleted === true) {
    k.where('deleted', 1);
  }
  if (deleted === false) {
    k.where('deleted', '<>', 1);
  }
};
