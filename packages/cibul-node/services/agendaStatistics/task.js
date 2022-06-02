'use strict';

const _ = require('lodash');
const logs = require('@openagenda/logs');
const log = require('@openagenda/logs')('services/agendaStatistics');
const rebuildActivityFeeds = require('@openagenda/activities/dist/service/rebuild').rebuild;

async function resyncLegacySearch(services, agendaUid) {
  log('info', 'resyncing agenda %d - legacy search index rebuild', agendaUid);

  const agendaId = await services.knex('review').first('id')
    .where('uid', agendaUid)
    .then(result => result.id);

  const result = await services.elasticsearch.resync({ agendaId });

  log('info', 'agenda %d, resynced legacy search index', agendaId, result);
}

async function resyncSearch(core, eventSearch, agendaUid) {
  const agenda = await core.agendas(agendaUid).get({
    detailed: true,
    access: 'internal',
    private: null
  });

  log('info', 'resyncing agenda %d - new search index rebuild', agendaUid);

  try {
    const result = await eventSearch.agendas(agenda).rebuild();

    log('info', 'agenda %d, resynced search index', agendaUid, result);
  } catch (e) {
    log('error', 'agenda %d, resync failed', agendaUid, e);
  }
}

function processJob({ services, config }) {
  const {
    activities: activitiesSvc
  } = services;

  const { syncAgenda } = services.inboxes.tasks.sync;

  return (data, cb) => {
    log('processing %j', data);
    if (data.operation !== 'resync') return cb();

    switch (data.type) {
      case 'controlData':
        return services.legacy.controlData.rebuild(data.agendaUid).then(() => cb(), cb);

      case 'customToLegacy':
        services.legacy.tagsAndCustom.setAll(data.agendaUid);
        break;

      case 'search':
        resyncSearch(services.core, services.eventSearch, data.agendaUid);
        break;

      case 'agendaEvents':
        log('resyncing agenda %d - agendaEvents resync', data.agendaUid);
        services.agendaEvents.tasks.transferLegacyData({ agendaUid: data.agendaUid });
        break;

      case 'legacySearch':
        resyncLegacySearch(services, data.agendaUid);
        break;

      case 'inbox':
        services.agendas.get({ uid: data.agendaUid }, { private: null, internal: true }, (err, agenda) => {
          const stats = {};

          syncAgenda(agenda, stats)
            .then(() => {
              log('info', 'Agenda %d inbox synced', agenda.uid, stats);
            });
        });
        break;

      case 'activityFeeds':
        rebuildActivityFeeds(
          null,
          {
            agendaUid: data.agendaUid,
            ..._.pick(config.db, ['database', 'host', 'port', 'user', 'password', 'ssl']),
            activityTable: config.schemas.activity,
            feedTable: config.schemas.feed,
            feedActivityTable: config.schemas.feed_activity,
            feedFollowTable: config.schemas.feed_follow,
            feedNotificationTable: config.schemas.feed_notification,
            userTable: config.schemas.user,
            reviewTable: config.schemas.agenda,
            reviewArticleTable: config.schemas.agendaEvent,
            eventTable: config.schemas.event,
            reviewerTable: config.schemas.stakeholder,
            aggregatorTable: config.schemas.aggregator,
            migrationTable: 'activity_migrations',
            logger: config.getLogConfig('oa', 'agendaStatistics', false),
            cli: false,
            service: activitiesSvc
          },
          logs('activities/rebuild')
        );
        break;
      default:
        log('unrecognized task', data.type);
    }

    return cb();
  };
}

module.exports = (config, services) => {
  const q = services.queues('agendaStatistics');

  return Object.assign(() => {
    q.register({
      processJob: processJob({ services, config })
    });

    q.run();
  }, {
    enqueueResync: (agendaUid, type) => {
      q('processJob', {
        operation: 'resync',
        agendaUid,
        type
      }).then(() => log('enqueued %s %s', agendaUid, type));
    },
    resyncLegacySearch: async () => {
      let offset = 0;

      let agendas = [];

      while ((agendas = await services.agendas.list(offset, 1, { private: null })).length) {
        const agenda = _.first(agendas);

        await resyncLegacySearch(services, agenda.uid);

        offset += 1;
      }

      log('info', 'DONE RESYNCING ALL AGENDAS');
    }
  });
};
