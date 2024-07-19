import AgendaLocations from '@openagenda/agenda-locations';
import logs from '@openagenda/logs';
import getEventCounts from './interfaces/getEventCounts.js';
import getAgendaDetailsByUid from './interfaces/getAgendaDetailsByUid.js';
import getSetAgendasCount from './interfaces/getSetAgendasCount.js';
import beforeMerge from './interfaces/beforeMerge.js';
import beforeRemove from './interfaces/beforeRemove.js';
import getAgendaUidsByIds from './interfaces/getAgendaUidsByIds.js';
import onUpdate from './interfaces/onUpdate.js';
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
  const queue = services.queues('locations');
  let taskRunning = false;

  const { geocoder } = services;

  queue.register({
    syncImpactedEventsAndAgendas: syncImpactedEventsAndAgendas(services),
    updateEventLocationReferences: updateEventLocationReferences(services),
  });

  queue.on('error', (task, args, err) => log('error', 'task %s error', task, err));

  const instance = AgendaLocations({
    knex: config.knex,
    redis: services.redis,
    imagePath: config.aws.imageBucketPath,
    interfaces: {
      beforeMerge: beforeMerge(queue, services),
      beforeRemove: beforeRemove(services),
      onLocationCreate: onLocationCreate(services),
      onUpdate: onUpdate(queue, services),
      getAgendaDetailsByUid: getAgendaDetailsByUid(config, services),
      getEventCounts: getEventCounts(config, services),
      getSetAgendasCount: getSetAgendasCount(services),
      geocode: (address, { countryCode, language }) => geocoder(address, { countryCode, language }),
      reverseGeocode: (lat, lng, options = {}) => geocoder.reverse(lat, lng, options),
      getAgendaLocationSettings: getAgendaLocationSettings(services),
      getLinkedAgendas: getLinkedAgendas(services),
      getAgendaUidsByIds: getAgendaUidsByIds(services),
    },
    Files: services.files,
    logger: config.getLogConfig('svc', 'agendaLocations'),
  });
  return Object.assign(instance, {
    apps: Object.assign(plugApp.bind(null, { ...config, geocoder }, services, instance), {
      agendaAdmin: plugAgendaAdminApp.bind(null, config, services, instance),
      agenda: plugAgendaApp.bind(null, services, instance),
    }),
    shutdown: async (options = {}) => {
      if (!taskRunning) return;

      log('stopping task');
      await queue.stop({ remove: true, clear: options.clear || options.reset });

      log('task stopped');
    },
    task: async (options = {}) => {
      const {
        duplicationDetection,
        reset = false,
      } = options;
      taskRunning = true;
      log('task');
      if (duplicationDetection?.enabled) {
        detectDuplicateCandidates(services, duplicationDetection);
      }
      // clearAllDuplicateCandidates(services);
      if (reset) {
        await queue.clear();
      }
      queue.run();
    },
  });
}
