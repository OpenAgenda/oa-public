'use strict';

async function getTagSet({ knex, interfaces }, agendaUid) {
  const agendaId = await interfaces.getAgendaId(agendaUid);

  if (!agendaId) {
    return null;
  }

  return knex('tag_set').first('store').where('id', agendaId).then(r => (r ? JSON.parse(r.store) : null));
}

module.exports = getTagSet;
