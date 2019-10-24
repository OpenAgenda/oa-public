'use strict';

const validate = require('./validate');
const db = require('../utils/db');
const getAgendaId = require('../utils/getAgendaId');
const aggregatorExists = require('../utils/aggregatorExists');
const Log = require('../utils/Log')('Aggregators/set');

module.exports = async (knex, agendaUid, data) => {
  const log = Log(`setting ${agendaUid}`);
  const clean = validate(data);
  clean.updatedAt = clean.createdAt = new Date();

  const agendaId = await getAgendaId(knex, agendaUid);
  const exists = await aggregatorExists(knex, agendaId);

  const entry = db.toEntry({
    ...clean,
    updatedAt: new Date(),
    ...exists ? {} : { agendaId, createdAt: new Date() }
  });

  if (!exists) {
    log('creating');
    const result = await knex('aggregator').insert(entry);
  } else {
    log('updating');
    const result = await knex('aggregator').update(entry).where('review_id', agendaId);
  }

  return {
    operation: exists ? 'update' : 'create'
  }
}
