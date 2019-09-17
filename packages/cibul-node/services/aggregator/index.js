"use strict";

const _ = require('lodash');

const aggregators = require( '@openagenda/aggregators' );
const log = require( '@openagenda/logs' )( 'services/aggregator' );
const queue = require( '@openagenda/queue' );

const interfaces = require( './interfaces' );

const config = require( '../../config' );
const coms = require( '../../lib/coms' );
const evaluate = require( './lib/evaluate' );
const isAggregator = require( './lib/isAggregator' );
const notify = require( './lib/notify' );
const sources = require( './lib/sources' );
const task = require( './lib/task' );

const onError = require( '../errors' ).bind( null, 'aggregator' );

const q = queue( config.queues.aggregator, {
  redis: config.redis,
  schedulable: true,
  onError
} );

const pQ = queue( config.queues.aggregator + ':priority', {
  redis: config.redis,
  schedulable: true,
  onError
} );

module.exports = {
  instance: {
    notify: () => log('warn', 'aggregator instance is not initialized')
  },
  isAggregator,
  notifyPublish: notify.publish,
  notifyUnpublish: notify.unpublish,
  sourceAdd: sources.add,
  sourceRemove: sources.remove,
  test: {
    clear: q.test.clear.bind( null, config.queues.aggregator ),
    flush: q.test.flush,
    evaluate,
    process: sources.process
  },
  task,
  init: (config, services) => {
    Object.assign(
      module.exports.instance,
      aggregators.createInstance({
        knex: config.knex,
        queues: services.queues,
        interfaces: {
          getAggregatorMergedSchema: agendaUid => services
            .core.agendas(agendaUid)
            .settings.schema.getMerged(),
          getAggregatorEventReference: (aggregatorAgendaUid, eventUid) => services
            .agendaEvents(aggregatorAgendaUid).get(eventUid)
            .then(ae => ae ? _.pick(ae, ['sourceAgendaUid']) : null),
          setSourceUidOnExistingReference: services.agendaEvents.utils.setSourceUid,
          unsetSourceUidOnExistingReference: services.agendaEvents.utils.unsetSourceUid,
          referenceEvent: async (sourceAgendaUid, aggregatorAgendaUid, eventUid, data) => {
            try {
              await services.core.agendas(aggregatorAgendaUid).events.add(eventUid, data);
            } catch (e) {
              log('error', 'could not add event %s from %s to aggregator %s',
                eventUid,
                sourceAgendaUid,
                aggregatorAgendaUid,
                e.name === 'validationError' ? e.jse_info.errors : e
              );
            }
          },
          unreferenceEvent: async (sourceAgendaUid, aggregatorAgendaUid, eventUid) => {
            try {
              await services.core.agendas(aggregatorAgendaUid).events.remove(eventUid);
            } catch (e) {
              log('error', 'could not remove event %s from aggregator %s',
                eventUid,
                aggregatorAgendaUid,
                e.name === 'validationError' ? e.jse_info.errors : e
              );
            }
          }
        }
      })
    );

    aggregators.init( {
      knex: config.knex,
      logger: config.getLogConfig( 'svc', 'aggregators' ),
      interfaces: {
        keepActiveAggregators: interfaces.keepActiveAggregators,
        getObject: interfaces.getAgenda,
        getObjectItems: interfaces.listAgendaEvents,
        evaluateObjectItem: async ( aggregator, agenda, agendaEvent ) => {

          enqueueEvaluate( 'publish', agendaEvent.eventUid, agendaEvent.agendaUid, aggregator.object.uid, true );

        },
        onResyncDone: ( aggregator, sourceAgendas ) => {

          log( 'info', 'done with resync on agenda %s with %s sources', aggregator.object.uid, sourceAgendas.length );

          coms.publish( config.mainChannel, {
            name: 'agenda.update',
            values: {
              id: aggregator.object.id,
              type: 'refresh'
            }
          } );

        }
      }
    } );
  }
}

notify.set( { q, pQ } );

sources.set( { q, pQ } );

task.set( { q, pQ } );


async function enqueueEvaluate( method, eventUid, sourceAgendaUid, aggregatorAgendaUid, mute ) {

  if ( ![ 'publish', 'unpublish' ].includes( method ) ) {

    log( 'error', 'enqueue method unknown: %s', method );

    return false;

  }

  const event = await config.knex('event')
    .first([ 'id' ])
    .where({ uid: eventUid })

  const sourceAgenda = await interfaces.getAgenda( sourceAgendaUid );

  const aggregatorAgenda = await interfaces.getAgenda( aggregatorAgendaUid );

  if ( !event ) log( 'error', 'enqueue: event %s was not found', eventUid );

  if ( !sourceAgenda ) log( 'error', 'enqueue: source agenda %s was not found', sourceAgendaUid );

  if ( !aggregatorAgendaUid ) log( 'error', 'enqueue: aggregator agenda %s was not found', aggregatorAgendaUid );

  if ( event && sourceAgenda ) {

    q( {
      method: 'notify.publish',
      args: [ event.id, sourceAgenda.id, mute ]
    } );

  }

}
