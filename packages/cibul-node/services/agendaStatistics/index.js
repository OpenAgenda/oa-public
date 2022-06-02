'use strict';

const agendaEventStats = require('./lib/agendaEventStats');
const db = require('./lib/db');
const legacySearch = require('./lib/legacySearch');
const searchStats = require('./lib/search');

const Task = require('./task');

module.exports.init = (config, services) => {
  const task = Task(config, services);

  return Object.assign(async agendaUid => {
    const agenda = await services.knex('review')
      .first(['id', 'uid', 'slug', 'form_schema_id'])
      .where('uid', agendaUid);
    return {
      db: await db(agenda.id),
      legacySearch: await legacySearch(agenda.id),
      agendaEvents: await agendaEventStats(services, agendaUid),
      search: await searchStats(services.eventSearch, agenda),
      hasFormSchema: !!agenda.form_schema_id,
      actions: {
        resyncLegacySearch: `${config.root}/${agenda.slug}/admin/stats/resync/legacySearch`,
        rebuildSearch: `${config.root}/${agenda.slug}/admin/stats/resync/search`,
        resyncAgendaEvents: `${config.root}/${agenda.slug}/admin/stats/resync/agendaEvents`,
        resyncInbox: `${config.root}/${agenda.slug}/admin/stats/resync/inbox`,
        resyncActivityFeeds: `${config.root}/${agenda.slug}/admin/stats/resync/activityFeeds`,
        resyncCustomDatasetToLegacy: `${config.root}/${agenda.slug}/admin/stats/resync/customToLegacy`,
        resyncControlData: `${config.root}/${agenda.slug}/admin/stats/resync/controlData`,
        legacyToFormSchema: `${config.root}/${agenda.slug}/admin/stats/transfer-form-schema`,
        formSchemaToTagSet: `${config.root}/${agenda.slug}/admin/stats/transfer-to-tagset`,
        formSchemaToCategorySet: `${config.root}/${agenda.slug}/admin/stats/transfer-to-categoryset`,
        formSchemaToCustom: `${config.root}/${agenda.slug}/admin/stats/transfer-to-custom`,
      }
    };
  }, {
    task,
    resync: task.enqueueResync
  });
};
