'use strict';

const db = require('../utils/db');
const getAgendaId = require('../utils/getAgendaId');

module.exports = async (knex, agendaUid) => {
  const agendaId = await getAgendaId(knex, agendaUid);

  if (!agendaId) throw new Error('Agenda not found');

  return knex('aggregator')
    .first('*')
    .where('review_id', agendaId)
    .then(r => r ? db.fromEntry(r) : null);
}
