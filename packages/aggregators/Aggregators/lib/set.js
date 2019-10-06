'use strict';

const validate = require('./validate');
const db = require('../utils/db');

module.exports = async (knex, agendaUid, data) => {
  const clean = validate(data);
  clean.updatedAt = clean.createdAt = new Date();

  const agendaId = await knex('review').first('id')
    .where('uid', agendaUid)
    .then(r => r ? r.id : null);

  const exists = await knex('aggregator').first('id')
    .where('review_id', agendaId)
    .then( r => !!r);

  const entry = db.toEntry({
    ...clean,
    updatedAt: new Date(),
    ...exists ? {} : { agendaId, createdAt: new Date() }
  });

  if (!exists) {
    const result = await knex('aggregator').insert(entry);
  } else {
    const result = await knex('aggregator').update(entry).where('review_id', agendaId);
  }

  return {
    operation: exists ? 'update' : 'create'
  }
}
