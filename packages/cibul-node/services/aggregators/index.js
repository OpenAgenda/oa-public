'use strict';

const _ = require('lodash');

const Aggregators = require('@openagenda/aggregators');
const log = require('@openagenda/logs')('services/aggregators');

const plugApp = require('./plugApp');

module.exports.init = (config, services) => {
  log('init');
  const {
    agendas,
    tracker
  } = services;

  const aggregators = Aggregators({
    knex: config.knex,
    queues: services.queues,
    logger: config.getLogConfig('svc', 'aggregators'),
    interfaces: {
      getMergedSchema: agendaUid => {
        return services.core.agendas(agendaUid).settings.schema.getMerged()
      },
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
              batched
            });
          tracker('aggregators.referenceEvent.done');
          return {
            success: true
          }
        } catch (e) {
          log('error', 'could not add event %s from %s to aggregator %s',
            eventUid,
            sourceAgenda.uid,
            aggregatorAgendaUid,
            e.name === 'ValidationError' ? e.jse_info.errors : e
          );
          return {
            success: false,
            errors: e.name === 'ValidationError' ? e.jse_info.errors : e
          };
        }
      },
      unreferenceEvent: async (aggregatorAgendaUid, eventUid, { batched }) => {
        try {
          await services.core.agendas(aggregatorAgendaUid).events.remove(eventUid, { batched });
          return {
            success: true
          }
        } catch (e) {
          log('error', 'could not remove event %s from aggregator %s',
            eventUid,
            aggregatorAgendaUid,
            e.name === 'ValidationError' ? e.jse_info.errors : e
          );
          return {
            success: false,
            errors: e.name === 'ValidationError' ? e.jse_info.errors : e
          };
        }
      },
      getEventReference: (agendaUid, eventUid) => services
        .agendaEvents(agendaUid).get(eventUid)
        .then(ae => ae ? {
          sourcePaths: ae.sourceAgendaUid,
          aggregated: ae.aggregated
        } : null),
      listEventReferences: (agendaUid, lastId, aggregated = null) => services.core.agendas(agendaUid)
        .events.list({ state: 2, aggregated }, { lastId }, { load: { events: false, custom: false } }),
      loadEvent: (agendaUid, eventUid) => services.core.agendas(agendaUid)
        .events.get(eventUid, { detailed: true }),
      getAgendasByUidsAndSearch: (agendaUids, search = null) => agendas.list({
        uid: agendaUids,
        ...(search ? { search } : {})
      }, 0, 200, {
        internal: true,
        includeImagePath: true,
        useDefaultImage: true
      }).then(({ agendas }) => agendas.map(a =>
        _.pick(a, ['id', 'uid', 'title', 'slug', 'image', 'official', 'createdAt', 'updatedAt'])
      ))
    }

  });

  return Object.assign({
    plugApp: plugApp.bind(null, config),
    ...aggregators
  });
}
