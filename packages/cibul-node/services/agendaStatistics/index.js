import agendaEventStats from './lib/agendaEventStats.js';
import searchStats from './lib/search.js';

export function init(config, services) {
  return Object.assign(async (agendaUid) => {
    const agenda = await services
      .knex('review')
      .first(['id', 'uid', 'slug', 'form_schema_id'])
      .where('uid', agendaUid);
    return {
      agendaEvents: await agendaEventStats(services, agendaUid),
      search: await searchStats(services.eventSearch, agenda),
      hasFormSchema: !!agenda.form_schema_id,
      actions: {
        resyncAgendaEvents: `${config.root}/${agenda.slug}/admin/stats/resync/agendaEvents`,
      },
    };
  });
}
