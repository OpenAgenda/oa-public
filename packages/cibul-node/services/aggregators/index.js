'use strict';

const _ = require('lodash');

const Aggregators = require('@openagenda/aggregators');
const log = require('@openagenda/logs')('services/aggregators');

const plugApp = require('./plugApp');

module.exports.init = (config, services) => {
  log('init');
  const {
    agendas: agendasSvc,
    tracker
  } = services;

  let task;

  const aggregators = Aggregators({
    knex: config.knex,
    queues: services.queues,
    logger: config.getLogConfig('svc', 'aggregators'),
    interfaces: {
      getMergedSchema: agendaUid => services
        .core.agendas(agendaUid)
        .settings.schema.getMerged(),
      updateSourcePaths: services.agendaEvents.utils.setSourcePaths,
      referenceEvent: async (aggregatorAgendaUid, eventUid, data, { batched, paths, sourceAgenda }) => {
        tracker('aggregators.referenceEvent');
        try {
          await services.core
            .agendas(aggregatorAgendaUid)
            .events.add(eventUid, data, {
              aggregated: true,
              paths,
              sourceAgenda,
              batched,
              access: 'administrator'
            });
          tracker('aggregators.referenceEvent.done');
          return {
            success: true
          };
        } catch (e) {
          log('error', 'could not add event %s from %s to aggregator %s',
            eventUid,
            sourceAgenda.uid,
            aggregatorAgendaUid,
            e.name === 'ValidationError' ? e.detail : e);
          return {
            success: false,
            errors: e.name === 'ValidationError' ? e.detail : e
          };
        }
      },
      unreferenceEvent: async (aggregatorAgendaUid, eventUid, { batched }) => {
        try {
          await services.core.agendas(aggregatorAgendaUid).events.remove(eventUid, { batched });
          return {
            success: true
          };
        } catch (e) {
          log('error', 'could not remove event %s from aggregator %s',
            eventUid,
            aggregatorAgendaUid,
            e.name === 'ValidationError' ? e.detail : e);
          return {
            success: false,
            errors: e.name === 'ValidationError' ? e.detail : e
          };
        }
      },
      getEventReference: (agendaUid, eventUid) => services
        .agendaEvents(agendaUid).get(eventUid)
        .then(ae => (ae ? {
          sourcePaths: ae.sourceAgendaUid,
          aggregated: ae.aggregated
        } : null)),
      listEventReferences: (agendaUid, lastId, aggregated = null) => services.core.agendas(agendaUid)
        .events.list({
          state: 2,
          aggregated
        }, { lastId }, {
          load: {
            events: false,
            custom: false,
            agendaEvent: true
          },
          returnPayload: true
        }),
      loadEvent: (agendaUid, eventUid) => services.core.agendas(agendaUid)
        .events.get(eventUid, { detailed: true }),
      getAgendasByUidsAndSearch: (agendaUids, search = null) => agendasSvc.list({
        uid: agendaUids,
        ...(search ? { search } : {})
      }, 0, 200, {
        internal: true,
        includeImagePath: true,
        useDefaultImage: true
      }).then(({ agendas }) => agendas.map(a => _.pick(a, [
        'id', 'uid', 'title', 'slug', 'image', 'official', 'createdAt', 'updatedAt'
      ]))),
      getAggregatedCount: agendaUid => services.agendaEvents(agendaUid).getAggregatedCount()
    }
  });

  return {
    plugApp: plugApp.bind(null, config),
    ...aggregators,
    shutdown: async options => {
      if (!task) return;
      return options.clear ? task.stopAndClear() : task.stop();
    },
    task: () => {
      task = aggregators.task();
      return task;
    }
  };
};
