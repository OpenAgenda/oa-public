"use strict";

const agendaEvents = require( '@openagenda/agenda-events' );
const events = require( '@openagenda/events' );
const remove = require( '@openagenda/agenda-events/service/remove' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const VError = require( 'verror' );
const _ = require( 'lodash' );
const q = require( '@openagenda/queue' )( 'agendaEventsLegacy', { redis: config.redis } );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/legacy' );

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

  log( 'evaluating action %s', action.name );

  let result = null;

  try {

    // if event is not present in events service, do nothing.
    if ( action.name === 'review.article_create' && !await _eventExists( action.values.id ) ) {

      action.increment = ( action.increment || 0 );

      log( 'info', 'new event was not yet created for article id %s', action.values.id );

      if ( action.increment < 10 ) {

        q( _.extend( action, { increment: action.increment + 1 } ) );

      } else {

        log( 'info', 'retried too many times. Leaving it be' );

      }

      result = { queued: true, action };

    } else if ( action.name === 'review.article_create' ) {
      
      result = await agendaEvents.legacyTransfer( action.values.id, {
        context: { 
          userUid: action.values.user_uid 
        } 
      } );

    } else if ( action.name === 'event.update' && action.values.type !== 'event.remove' ) {

      result = await agendaEvents.legacyTransfer( { 
        eventId: action.values.id,
        agendaId: action.values.agendaId || action.values.review_id
      }, {
        force: _.get( action, 'values.force' ),
        context: { 
          userUid: action.values.user_uid,
          agendaUid: action.values.sourceAgendaUid || null
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


async function _eventExists( articleId ) {


  const event = await config.knex( 'event as e' ).first( [ 'uid' ] )
    .leftJoin( 'review_article as ra', 'ra.event_id', 'e.id' )
    .where( { 'ra.id': articleId } );

  if ( !event ) return false;

  const newEvent = await events.get( { uid: event.uid }, { private: null } );

  return !!newEvent;

}
