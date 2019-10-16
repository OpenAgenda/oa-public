'use strict';

const getAgendaId = require('../utils/getAgendaId');
const aggregatorExists = require('../utils/aggregatorExists');

module.exports = async (knex, agendaUid) => {
  const agendaId = await getAgendaId(knex, agendaUid);
  const exists = await aggregatorExists(knex, agendaId);

  if (!exists) {
    throw new Error('Aggregator not found');
  }

  const result = await knex('aggregator').delete().where({
    review_id: agendaId
  });

  return {
    success: result === 1
  }
}
