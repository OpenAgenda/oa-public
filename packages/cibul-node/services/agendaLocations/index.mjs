import AgendaLocations from '@openagenda/agenda-locations';
import logs from '@openagenda/logs';
import getEventCounts from './interfaces/getEventCounts.mjs';
import getAgendaDetailsByUid from './interfaces/getAgendaDetailsByUid.mjs';
import getSetAgendasCount from './interfaces/getSetAgendasCount.mjs';
import beforeMerge from './interfaces/beforeMerge.mjs';
import beforeRemove from './interfaces/beforeRemove.mjs';
import getAgendaUidsByIds from './interfaces/getAgendaUidsByIds.mjs';
import onUpdate from './interfaces/onUpdate.mjs';
import getAgendaLocationSettings from './interfaces/getAgendaLocationSettings.mjs';
import getLinkedAgendas from './interfaces/getLinkedAgendas.mjs';
import onLocationCreate from './interfaces/onLocationCreate.mjs';
import plugAgendaApp from './plugAgendaApp.mjs';
import plugAgendaAdminApp from './plugAgendaAdminApp.mjs';
import plugApp from './plugApp.mjs';
import syncImpactedEventsAndAgendas from './tasks/syncImpactedEventsAndAgendas.mjs';
import updateEventLocationReferences from './tasks/updateEventLocationReferences.mjs';
import detectDuplicateCandidates from './tasks/detectDuplicateCandidates.mjs';
// const clearAllDuplicateCandidates = require('./tasks/clearAllDuplicateCandidates.mjs');

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
