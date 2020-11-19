'use strict';

const _ = require('lodash');
const AgendaLocations = require('@openagenda/agenda-locations');
const OpenCage = require('@openagenda/geocoder/Opencage');
const log = require('@openagenda/logs')('services/agendaLocations');

const getEventCounts = require('./interfaces/getEventCounts');
const getAgendaDetailsByUid = require('./interfaces/getAgendaDetailsByUid');
const getSetAgendasCount = require('./interfaces/getSetAgendasCount');
const beforeMerge = require('./interfaces/beforeMerge');
const beforeRemove = require('./interfaces/beforeRemove');
const onUpdate = require('./interfaces/onUpdate');

const plugAgendaApp = require('./plugAgendaApp');
const plugAgendaAdminApp = require('./plugAgendaAdminApp');
const plugApp = require('./plugApp');

const syncImpactedEventsAndAgendas = require('./tasks/syncImpactedEventsAndAgendas');
const resyncAllAgendaLocations = require('./tasks/resyncAllAgendaLocations');

module.exports.init = async (config, services) => {
  const queue = services.queues('locations');

  queue.register({
    syncImpactedEventsAndAgendas: syncImpactedEventsAndAgendas.bind(null, services),
    resyncAllAgendaLocations: resyncAllAgendaLocations.bind(null, services),
  });

  queue.on('error', (task, args, err) => log('error', 'task %s error', task, err));

  const geocoder = OpenCage(config.opencage);

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
      geocode: (address, { countryCode, language }) => geocoder(address, { countryCode, language })
    },
    Files: services.files,
    logger: config.getLogConfig('svc', 'agendaLocations')
  });

  return Object.assign(instance, {
    apps: Object.assign(plugApp.bind(null, { ...config, geocoder }, services, instance), {
      agendaAdmin: plugAgendaAdminApp.bind(null, config, services, instance),
      agenda: plugAgendaApp.bind(null, config, services, instance)
    }),
    task: Object.assign(async (options = {}) => {
      log('task');
      if (options.reset) {
        await queue.clear();
      }
      queue.run();
    }, {
      stop: async (options = {}) => {
        if (options.reset) {
          await queue.clear();
        }
        return queue.stop();
      }
    })
  })
}
