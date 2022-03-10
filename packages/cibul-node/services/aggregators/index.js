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
      updateSourcePaths: ({
        aggregatorAgendaUid,
        eventUid,
        paths
      }) => services.agendaEvents.utils.setSourcePaths(aggregatorAgendaUid, eventUid, paths),
      referenceEvent: async ({
        aggregatorAgendaUid,
        eventUid,
        payload,
        batched,
        paths,
        sourceAgenda,
        aggregated
      }) => {
        tracker('aggregators.referenceEvent');
        try {
          log('referencing event %s in agenda %s', eventUid, aggregatorAgendaUid);
          await services.core
            .agendas(aggregatorAgendaUid)
            .events.add(eventUid, payload, {
              aggregated,
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
            e.name === 'BadRequest' ? e.info : e);
          return {
            success: false,
            errors: e.name === 'BadRequest' ? e.info : e
          };
        }
      },
      updateEventReference: async ({
        aggregatorAgendaUid,
        eventUid,
        payload,
        batched,
        aggregated
      }) => {
        tracker('aggregators.updateEventReference');
        try {
          await services.core.agendas(aggregatorAgendaUid).events.update(eventUid, payload, {
            aggregated,
            batched,
            partial: true,
            access: 'administrator'
          });
          tracker('aggregators.updateEventReference.done');
          return {
            success: true
          };
        } catch (e) {
          log('error', 'could not patch event %s on aggregator %s',
            eventUid,
            aggregatorAgendaUid,
            e.name === 'BadRequest' ? e.info : e);
          return {
            success: false,
            errors: e.name === 'BadRequest' ? e.info : e
          };
        }
      },
      unreferenceEvent: async (aggregatorAgendaUid, eventUid, { batched }) => {
        try {
          await services.core.agendas(aggregatorAgendaUid).events.remove(eventUid, {
            batched,
            protectFromOriginRemove: true
          });
          return {
            success: true
          };
        } catch (e) {
          log('error', 'could not remove event %s from aggregator %s',
            eventUid,
            aggregatorAgendaUid,
            e.name === 'BadRequest' ? e.info : e);
          return {
            success: false,
            errors: e.name === 'BadRequest' ? e.info : e
          };
        }
      },
      getEventReference: (agendaUid, eventUid) => services
        .agendaEvents(agendaUid).get(eventUid)
        .then(ae => (ae ? {
          sourcePaths: ae.sourcePaths,
          aggregated: ae.aggregated
        } : null)),
      listEventReferences: (agendaUid, after, query = {}) => services.core.agendas(agendaUid).events.search(
        query,
        { after },
        { useAfterKey: true, detailed: true }
      ),
      loadEvent: (agendaUid, eventUid) => services.core.agendas(agendaUid)
        .events.get(eventUid, { detailed: true }),
      getAgendasByUids: (agendaUids, options = {}) => {
        const query = ['search', 'slug']
          .filter(k => !!options[k])
          .reduce((q, k) => ({ ...q, [k]: options[k] }), { uid: agendaUids });

        log('getting agendas for %j', query);

        return agendasSvc.list(query, 0, 200, {
          internal: true,
          includeImagePath: true,
          useDefaultImage: true
        }).then(({ agendas }) => agendas.map(a => _.pick(a, [
          'id', 'uid', 'title', 'slug', 'image', 'official', 'createdAt', 'updatedAt'
        ])));
      },
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
