'use strict';

const AgendaLocations = require('@openagenda/agenda-locations');
const log = require('@openagenda/logs')('services/agendaLocations');

const getEventCounts = require('./interfaces/getEventCounts');
const getAgendaDetailsByUid = require('./interfaces/getAgendaDetailsByUid');
const getSetAgendasCount = require('./interfaces/getSetAgendasCount');
const beforeMerge = require('./interfaces/beforeMerge');
const beforeRemove = require('./interfaces/beforeRemove');
const getAgendaUidsByIds = require('./interfaces/getAgendaUidsByIds');
const onUpdate = require('./interfaces/onUpdate');
const getAgendaLocationSettings = require('./interfaces/getAgendaLocationSettings');
const getLinkedAgendas = require('./interfaces/getLinkedAgendas');

const plugAgendaApp = require('./plugAgendaApp');
const plugAgendaAdminApp = require('./plugAgendaAdminApp');
const plugApp = require('./plugApp');

const syncImpactedEventsAndAgendas = require('./tasks/syncImpactedEventsAndAgendas');
const detectDuplicateCandidates = require('./tasks/detectDuplicateCandidates');
// const clearAllDuplicateCandidates = require('./tasks/clearAllDuplicateCandidates');

module.exports.init = async (config, services) => {
  const queue = services.queues('locations');
  let taskRunning = false;

  const { geocoder } = services;

  queue.register({
    syncImpactedEventsAndAgendas: syncImpactedEventsAndAgendas(services),
  });

  queue.on('error', (task, args, err) => log('error', 'task %s error', task, err));

  const instance = AgendaLocations({
    knex: config.knex,
    redis: config.redisClient,
    imagePath: config.aws.imageBucketPath,
    interfaces: {
      beforeMerge: beforeMerge(services),
      beforeRemove: beforeRemove(services),
      onUpdate: onUpdate(queue),
      getAgendaDetailsByUid: getAgendaDetailsByUid(config, services),
      getEventCounts: getEventCounts(config, services),
      getSetAgendasCount: getSetAgendasCount(services),
      geocode: (address, { countryCode, language }) => geocoder(address, { countryCode, language }),
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
};
