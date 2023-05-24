'use strict';

const _ = require('lodash');
const logs = require('@openagenda/logs');

const log = logs('services/agendaStatistics');

async function resyncSearch(core, agendaUid) {
  log('info', 'resyncing agenda %d - new search index rebuild', agendaUid);

  try {
    const result = await core.agendas(agendaUid).events.search.rebuild();

    log('info', 'agenda %d, resynced search index', agendaUid, result);
  } catch (e) {
    log('error', 'agenda %d, resync failed', agendaUid, e);
  }
}

function processJob({ services }) {
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
        resyncSearch(services.core, data.agendaUid);
        break;

      case 'agendaEvents':
        log('resyncing agenda %d - agendaEvents resync', data.agendaUid);
        services.agendaEvents.tasks.transferLegacyData({ agendaUid: data.agendaUid });
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
        services.activities.tasks.agendaRebuild(data.agendaUid);
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
      processJob: processJob({ services, config }),
    });

    q.run();
  }, {
    enqueueResync: (agendaUid, type) => {
      q('processJob', {
        operation: 'resync',
        agendaUid,
        type,
      }).then(() => log('enqueued %s %s', agendaUid, type));
    },
  });
};
