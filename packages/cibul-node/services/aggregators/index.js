'use strict';

const _ = require('lodash');

const Aggregators = require('@openagenda/aggregators');
const log = require('@openagenda/logs')('services/aggregators');

const plugApp = require('./plugApp');

module.exports = {
  notify: () => log('warn', 'aggregator instance is not initialized'),
  addSource: () => log('warn', 'aggregator instance is not initialized'),
  removeSource: () => log('warn', 'aggregator instance is not initialized'),
  init: (config, services) => {
    log('init');
    const {
      agendas
    } = services;

    const aggregators = Aggregators({
      knex: config.knex,
      queues: services.queues,
      logger: config.getLogConfig('svc', 'aggregators'),
      interfaces: {
        getMergedSchema: agendaUid => services
          .core.agendas(agendaUid)
          .settings.schema.getMerged(),
        setSourceUidOnExistingReference: services.agendaEvents.utils.setSourceUid,
        unsetSourceUidOnExistingReference: services.agendaEvents.utils.unsetSourceUid,
        referenceEvent: async (sourceAgenda, aggregatorAgendaUid, eventUid, data, { batched }) => {
          try {
            await services.core
              .agendas(aggregatorAgendaUid)
              .events.add(eventUid, data, {
                aggregated: true,
                sourceAgenda,
                batched
              });
            return {
              success: true
            }
          } catch (e) {
            log('error', 'could not add event %s from %s to aggregator %s',
              eventUid,
              sourceAgenda.uid,
              aggregatorAgendaUid,
              e.name === 'validationError' ? e.jse_info.errors : e
            );
            return {
              success: false,
              errors: e.name === 'validationError' ? e.jse_info.errors : e
            };
          }
        },
        unreferenceEvent: async (sourceAgendaUid, aggregatorAgendaUid, eventUid, { batched }) => {
          try {
            await services.core.agendas(aggregatorAgendaUid).events.remove(eventUid, { batched });
            return {
              success: true
            }
          } catch (e) {
            log('error', 'could not remove event %s from aggregator %s',
              eventUid,
              aggregatorAgendaUid,
              e.name === 'validationError' ? e.jse_info.errors : e
            );
            return {
              success: false,
              errors: e.name === 'validationError' ? e.jse_info.errors : e
            };
          }
        },
        getEventReference: (agendaUid, eventUid) => services
          .agendaEvents(agendaUid).get(eventUid)
          .then(ae => ae ? _.pick(ae, ['sourceAgendaUid', 'aggregated']) : null),
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

    // for compatibility with legacy refs
    Object.assign(module.exports, aggregators);

    return Object.assign({
      plugApp: plugApp.bind(null, config),
      ...aggregators
    });
  }
}
