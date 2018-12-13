"use strict";

const agendaEvents = require( '@openagenda/agenda-events' );
const events = require( '@openagenda/events' );
const agendas = require( '@openagenda/agendas' );
const remove = require( '@openagenda/agenda-events/service/remove' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const VError = require( 'verror' );
const _ = require( 'lodash' );
const q = require( '@openagenda/queue' )( 'agendaEventsLegacy', { redis: config.redis } );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/legacy' );

const agendaGetOptions = {
  private: null,
  internal: true,
  includeImagePath: true
};

const monitored = [ 'event.update', 'review.article_create', 'event.remove' ];

module.exports = {
  task,
  evaluate: evaluate.bind( null, null )
}

function task() {

  coms.subscribe( config.mainChannel, evaluate );

  q.setConsumer( evaluate.bind( null, null ) );

  q.launch( { interval: 1000 } );

}

async function evaluate( err, action ) {

  if ( err ) return log( 'error', 'coms subscribe error', err );

  if ( monitored.includes( action.name ) ) {

    log( 'evaluating action %j', action );

  } else {

    return log( 'ignoring action %s', action.name );

  }

  let result = null;

  const eventId = action.values.id;

  try {

    const {
      agendaUid,
      eventUid
    } = await _loadAgendaEventUids( action.name, action.values );

    const event = await events.get( { uid: eventUid }, { private: null, internal: true, detailed: true } );

    const sourceAgenda = _.get( action, 'values.sourceAgendaUid' )
      ? await agendas.get( { uid: _.get( action, 'values.sourceAgendaUid' ) }, agendaGetOptions )
      : null;

    // if event is not present in events service, do nothing.
    if ( !event ) {

      action.increment = ( action.increment || 0 );

      log( 'info', 'new event was not found for eventUid %s, %j', eventUid, action.values );

      if ( action.increment < 10 ) {

        q( _.extend( action, { increment: action.increment + 1 } ) );

      } else {

        log( 'info', 'retried too many times. Leaving it be' );

      }

      result = { queued: true, action };

    } else if ( action.name === 'review.article_create' ) {

      log( 'transfer of a create' );

      result = await agendaEvents.legacyTransfer( action.values.id, {
        context: {
          aggregated: !!sourceAgenda,
          userUid: action.values.user_uid,
          event,
          sourceAgenda,
          agenda: await agendas.get( { uid: agendaUid }, agendaGetOptions )
        }
      } );

    } else if ( action.name === 'event.update' && action.values.type !== 'event.remove' ) {

      log( 'transfer of an update' );

      result = await agendaEvents.legacyTransfer( {
        eventId: action.values.id,
        agendaId: action.values.agendaId || action.values.review_id
      }, {
        force: _.get( action, 'values.force' ),
        context: {
          aggregated: !!sourceAgenda,
          event,
          userUid: action.values.user_uid,
          agendaUid,
          sourceAgenda,
          agenda: await agendas.get( { uid: agendaUid }, agendaGetOptions )
        }
      } );

    } else if ( action.name === 'event.remove' ) {

      log( 'not acting on remove through legacy transfer. remove should be done through event interface' );

    } else {

      log( 'not acting on action %s', action.name );

    }

    if ( result ) {

      log( 'transfer result: %s', JSON.stringify( result ) );

    }

  } catch ( e ) {

    log( 'error', 'legacyTransfer failed for action with values %s: %s', JSON.stringify( action ), e );

  }

}


async function _loadAgendaEventUids( name, values ) {

  const { id } = values;

  const eventId = name !== 'review.article_create' ? values.id : null;

  const articleId = name === 'review.article_create' ? values.id : null;

  const agendaId = _.get( values, 'agendaId' );

  if ( values.type === 'event.remove' ) {

    const eventUid = eventId ? _.get( await config.knex.first( 'uid' ).from( 'event' ).where( 'id', eventId ), 'uid' ) : null;

    const agendaUid = agendaId ? _.get( await config.knex.first( 'uid' ).from( 'review' ).where( 'id', agendaId ), 'uid' ) : null;

    return { agendaUid, eventUid };

  }

  const q = config.knex
    .first( [ 'e.uid as eventUid', 'r.uid as agendaUid' ] )
    .from( 'review_article as ra' )
    .leftJoin( 'review as r', 'ra.review_id', 'r.id' )
    .leftJoin( 'event as e', 'ra.event_id', 'e.id' )
    .orderBy( 'ra.id', 'desc' );

  if ( eventId ) q.where( 'ra.event_id', eventId );

  if ( articleId ) q.where( 'ra.id', articleId );

  if ( agendaId ) q.where( 'ra.review_id', agendaId );

  return q.then( result => result || { eventUid: null, agendaUid: null } );

}
