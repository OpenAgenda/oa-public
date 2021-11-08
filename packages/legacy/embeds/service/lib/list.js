'use strict';

const {
  NotFound
} = require('@openagenda/verror');

const fromEntryToItem = require('./fromEntryToItem');
const appendDefaultTemplates = require('./appendDefaultTemplates');

module.exports = async ({ interfaces, knex, defaultTemplates }, agendaUid, options = {}) => {
  const agendaId = await interfaces.getAgendaId(agendaUid);
  if (!agendaId && options.throwIfNotFound) {
    throw new NotFound('agenda id not found for uid %d', agendaUid);
  } else if (!agendaId) {
    return null;
  }

  return knex('review_embed')
    .select('*')
    .where({
      review_id: agendaId
    })
    .then(entries => entries.map(fromEntryToItem.bind(null, {
      ...options,
      agendaUid
    })).map(entry => appendDefaultTemplates(entry, defaultTemplates)));
};
