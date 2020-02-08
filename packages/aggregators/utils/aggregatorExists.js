'use strict';

module.exports = (knex, agendaId) => knex('aggregator')
  .first('id')
  .where('review_id', agendaId)
  .then( r => !!r);
