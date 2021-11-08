'use strict';

const {
  NotFound
} = require('@openagenda/verror');

const fromEntryToItem = require('./fromEntryToItem');
const appendDefaultTemplates = require('./appendDefaultTemplates');

module.exports = async ({ interfaces, knex, defaultTemplates }, agendaUid, uid, options = {}) => {
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

      const item = fromEntryToItem({ ...options, agendaUid }, entry);

      appendDefaultTemplates(item, defaultTemplates);

      return item;
    });
};
