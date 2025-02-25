import agendaEventStats from './lib/agendaEventStats.js';
import db from './lib/db.js';
import searchStats from './lib/search.js';
import Task from './task.js';

export function init(config, services) {
  const task = Task(config, services);

  return Object.assign(
    async (agendaUid) => {
      const agenda = await services
        .knex('review')
        .first(['id', 'uid', 'slug', 'form_schema_id'])
        .where('uid', agendaUid);
      return {
        db: await db(agenda.id),
        agendaEvents: await agendaEventStats(services, agendaUid),
        search: await searchStats(services.eventSearch, agenda),
        hasFormSchema: !!agenda.form_schema_id,
        actions: {
          resyncAgendaEvents: `${config.root}/${agenda.slug}/admin/stats/resync/agendaEvents`,
          resyncCustomDatasetToLegacy: `${config.root}/${agenda.slug}/admin/stats/resync/customToLegacy`,
          resyncControlData: `${config.root}/${agenda.slug}/admin/stats/resync/controlData`,
          formSchemaToTagSet: `${config.root}/${agenda.slug}/admin/stats/transfer-to-tagset`,
          formSchemaToCategorySet: `${config.root}/${agenda.slug}/admin/stats/transfer-to-categoryset`,
          formSchemaToCustom: `${config.root}/${agenda.slug}/admin/stats/transfer-to-custom`,
        },
      };
    },
    {
      task,
      resync: task.enqueueResync,
    },
  );
}
