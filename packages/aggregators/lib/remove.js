'use strict';

const getAgendaId = require('../utils/getAgendaId');
const aggregatorExists = require('../utils/aggregatorExists');
const Log = require('../utils/Log')('Aggregators/remove');

module.exports = async (knex, agendaUid) => {
  const log = Log(`agenda uid ${agendaUid}`);
  const agendaId = await getAgendaId(knex, agendaUid);
  const exists = await aggregatorExists(knex, agendaId);

  if (!exists) {
    log('aggregator not found, throwing error');
    throw new Error('Aggregator not found');
  }

  const result = await knex('aggregator').delete().where({
    review_id: agendaId
  });

  const success = result === 1;

  log(success ? 'success' : 'failed');

  return {
    success
  }
}
