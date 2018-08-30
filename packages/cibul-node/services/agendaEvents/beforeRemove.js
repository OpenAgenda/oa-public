"use strict";

const { promisify } = require( 'util' );
const VError = require( 'verror' );
const activitiesSvc = require( '@openagenda/activities' );
const usersSvc = require( '@openagenda/users' );
const agendasSvc = require( '@openagenda/agendas' );
const eventsSvc = require( '@openagenda/events' );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/beforeRemove' );

module.exports = async ( ae, context ) => {

  log( 'will remove agenda-event %j', ae, { context } );

  let user;
  let agenda;
  let event;

  if ( context.userUid ) {
    try {
      user = await usersSvc.get( context.userUid );
    } catch ( e ) {
      return log( 'error', new VError( e, 'Error to get user %s', context.userUid ) );
    }

    try {
      agenda = await promisify( agendasSvc.get )( { uid: ae.agendaUid }, { private: null } );
    } catch ( e ) {
      return log( 'error', new VError( e, 'Error to get agenda %s', ae.agendaUid ) );
    }

    try {
      event = await eventsSvc.get( { uid: ae.eventUid }, { deleted: null } );
    } catch ( e ) {
      return log( 'error', new VError( e, 'Error to get event %s', ae.eventUid ) );
    }

    if ( !user || !agenda || !event ) {
      return log( 'error', new VError( {
        info: { user, agenda, event }
      }, 'An entity is missing for add activity' ) );
    }

    try {
      if ( context.deletion && agenda.uid === context.agendaUid ) {
        await activitiesSvc.feed( { entityType: 'event', entityUid: event.uid } ).activities.add( {
          actor: 'user:' + user.uid,
          verb: 'event.delete',
          object: 'event:' + event.uid,
          target: 'agenda:' + agenda.uid,
          store: {
            labels: {
              actor: user.fullName,
              object: event.title,
              target: agenda.title
            }
          }
        } );
      } else if ( !context.deletion ) {
        await activitiesSvc.feed( { entityType: 'event', entityUid: event.uid } ).activities.add( {
          actor: 'user:' + user.uid,
          verb: 'agenda.removeEvent',
          object: 'event:' + event.uid,
          target: 'agenda:' + agenda.uid,
          store: {
            labels: {
              actor: user.fullName,
              object: event.title,
              target: agenda.title
            }
          }
        } );
      }
    } catch ( err ) {
      if ( err ) {
        log( 'error', 'Error to add activity agenda.removeEvent in feed event:%s', event.uid, err );
      }
    }
  }

  try {
    await activitiesSvc.feed( { entityType: 'agenda', entityUid: agenda.uid } )
      .unfollow( { entityType: 'event', entityUid: event.uid } );
  } catch ( err ) {
    if ( err ) {
      log( 'error',
        'Error when feed agenda:%s have tried to unfollow feed event:%s', agenda.uid, event.uid
      );
    }
  }

}
