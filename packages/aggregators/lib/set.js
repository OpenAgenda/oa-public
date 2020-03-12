'use strict';

const db = require('../utils/db');
const getAgendaId = require('../utils/getAgendaId');
const aggregatorExists = require('../utils/aggregatorExists');
const Log = require('../utils/Log')('Aggregators/set');
const validate = require('./validate');

module.exports = async (knex, agendaUid, data, options = {}) => {
  const log = Log(`setting ${agendaUid}`);
  const clean = validate(data, options);
  clean.createdAt = new Date();
  clean.updatedAt = clean.createdAt;

  const agendaId = await getAgendaId(knex, agendaUid);
  const exists = await aggregatorExists(knex, agendaId);

  const entry = db.toEntry({
    ...clean,
    updatedAt: new Date(),
    ...(exists ? {} : { agendaId, createdAt: new Date() })
  });

  if (!exists) {
    log('creating');
    await knex('aggregator').insert(entry);
  } else {
    log('updating');
    await knex('aggregator')
      .update(entry)
      .where('review_id', agendaId);
  }

  return {
    operation: exists ? (options.patch ? 'patch' : 'update') : 'create'
  };
};
