import logs from '@openagenda/logs';

const log = logs('services/agendaStatistics');

function processJob({ services }) {
  return (data, cb) => {
    log('processing %j', data);
    if (data.operation !== 'resync') return cb();

    switch (data.type) {
      case 'controlData':
        return services.legacy.controlData
          .rebuild(data.agendaUid)
          .then(() => cb(), cb);

      case 'customToLegacy':
        services.legacy.tagsAndCustom.setAll(data.agendaUid);
        break;

      case 'agendaEvents':
        log('resyncing agenda %d - agendaEvents resync', data.agendaUid);
        services.agendaEvents.tasks.transferLegacyData({
          agendaUid: data.agendaUid,
        });
        break;

      default:
        log('unrecognized task', data.type);
    }

    return cb();
  };
}

export default (config, services) => {
  const q = services.queues('agendaStatistics');

  return Object.assign(
    () => {
      log('task');
      q.register({
        processJob: processJob({ services, config }),
      });

      q.run();
    },
    {
      enqueueResync: (agendaUid, type) => {
        q('processJob', {
          operation: 'resync',
          agendaUid,
          type,
        }).then(() => log('enqueued %s %s', agendaUid, type));
      },
    },
  );
};
