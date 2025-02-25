import { NotFound } from '@openagenda/verror';
import fromEntryToItem from './fromEntryToItem.js';
import appendDefaultTemplates from './appendDefaultTemplates.js';

export default async (
  { interfaces, knex, defaultTemplates },
  agendaUid,
  options = {},
) => {
  const agendaId = await interfaces.getAgendaId(agendaUid);
  if (!agendaId && options.throwIfNotFound) {
    throw new NotFound('agenda id not found for uid %d', agendaUid);
  } else if (!agendaId) {
    return null;
  }

  return knex('review_embed')
    .select('*')
    .where({
      review_id: agendaId,
    })
    .then((entries) =>
      entries
        .map(
          fromEntryToItem.bind(null, {
            ...options,
            agendaUid,
          }),
        )
        .map((entry) => appendDefaultTemplates(entry, defaultTemplates)));
};
