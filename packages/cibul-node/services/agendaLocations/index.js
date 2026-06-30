import AgendaLocations from '@openagenda/agenda-locations';
import logs from '@openagenda/logs';
import getEventCounts from './interfaces/getEventCounts.js';
import getAgendaDetailsByUid from './interfaces/getAgendaDetailsByUid.js';
import getSetAgendasCount from './interfaces/getSetAgendasCount.js';
import beforeMerge from './interfaces/beforeMerge.js';
import beforeRemove from './interfaces/beforeRemove.js';
import getAgendaUidsByIds from './interfaces/getAgendaUidsByIds.js';
import onUpdate from './interfaces/onUpdate.js';
import onTransfer from './interfaces/onTransfer.js';
import getAgendaLocationSettings from './interfaces/getAgendaLocationSettings.js';
import getLinkedAgendas from './interfaces/getLinkedAgendas.js';
import onLocationCreate from './interfaces/onLocationCreate.js';
import plugAgendaApp from './plugAgendaApp.js';
import plugAgendaAdminApp from './plugAgendaAdminApp.js';
import plugApp from './plugApp.js';
import syncImpactedEventsAndAgendas from './tasks/syncImpactedEventsAndAgendas.js';
import updateEventLocationReferences from './tasks/updateEventLocationReferences.js';
import detectDuplicateCandidates from './tasks/detectDuplicateCandidates.js';
// const clearAllDuplicateCandidates = require('./tasks/clearAllDuplicateCandidates.js');

const log = logs('services/agendaLocations');

export async function init(config, services) {
  const { geocoder, bull } = services;

  const queue = new bull.Queue('locations', { prefix: '{locations}' });
  const worker = new bull.Worker(
    queue.name,
    (job) => {
      switch (job.name) {
        case 'syncImpactedEventsAndAgendas':
          return syncImpactedEventsAndAgendas(services, job.data);
        case 'updateEventLocationReferences':
          return updateEventLocationReferences(services, job.data);
        default:
          log.warn(`Unknown job ${job.name}`);
      }
    },
    {
      prefix: queue.opts.prefix,
      autorun: false,
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // keep up to 7 days
        count: 1000, // keep up to 1000 jobs
      },
    },
  );

  worker.on('error', (failedReason) => log.error('error', failedReason));
  worker.on('failed', (job, error) =>
    log.error('task %s error', job.name, error));

  const instance = AgendaLocations({
    knex: config.knex,
    redis: services.redis,
    imagePath: config.s3.mainBucketPath,
    interfaces: {
      beforeMerge: beforeMerge(queue, services),
      beforeRemove: beforeRemove(services),
      onLocationCreate: onLocationCreate(services),
      onUpdate: onUpdate(queue, services),
      onTransfer: onTransfer({ ...services, queue }),
      getAgendaDetailsByUid: getAgendaDetailsByUid(config, services),
      getEventCounts: getEventCounts(config, services),
      getSetAgendasCount: getSetAgendasCount(services),
      geocode: (address, { countryCode, language }) =>
        geocoder(address, { countryCode, language }),
      reverseGeocode: (lat, lng, options = {}) =>
        geocoder.reverse(lat, lng, options),
      getAgendaLocationSettings: getAgendaLocationSettings(services),
      getLinkedAgendas: getLinkedAgendas(services),
      getAgendaUidsByIds: getAgendaUidsByIds(services),
    },
    Files: services.files,
    logger: config.getLogConfig('svc', 'agendaLocations'),
  });
  return Object.assign(instance, {
    apps: Object.assign(
      plugApp.bind(null, { ...config, geocoder }, services, instance),
      {
        agendaAdmin: plugAgendaAdminApp.bind(null, services, instance),
        agenda: plugAgendaApp.bind(null, services, instance),
      },
    ),
    shutdown: async (options = {}) => {
      log('stopping task');
      await bull.teardownQueues(worker, queue, options);
      log('task stopped');
    },
    task: Object.assign(
      async (options = {}) => {
        const { reset = false } = options;

        log('task');

        // clearAllDuplicateCandidates(services);

        if (reset) {
          await queue.drain();
        }

        if (!worker.isRunning()) {
          worker.run();
        }
      },
      {
        detectDuplicateCandidates: detectDuplicateCandidates.bind(
          null,
          services,
          config.locationDuplicationDetection,
        ),
      },
    ),
  });
}
