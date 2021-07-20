'use strict';

const {
  NotFound
} = require('@openagenda/verror');

const fromEntryToItem = require('./fromEntryToItem');

module.exports = async ({ interfaces, knex }, agendaUid, uid, options = {}) => {
  const agendaId = await interfaces.getAgendaId(agendaUid);
  if (!agendaId && options.throwIfNotFound) {
    throw new NotFound('agenda id not found for uid %d', agendaUid);
  } else if (!agendaId) {
    return null;
  }

  return knex('review_embed')
    .first('*')
    .where({
      review_id: agendaId,
      uid
    })
    .then(entry => {
      if (!entry && !!options.throwIfNotFound) {
        throw new NotFound('embed not found for uid %d', uid);
      } else if (!entry) {
        return null;
      }

      return fromEntryToItem({ ...options, agendaUid }, entry);
    });
};
