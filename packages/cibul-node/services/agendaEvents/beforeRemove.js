"use strict";

const VError = require( 'verror' );
const log = require( '@openagenda/logs' )( 'agendaEvents/beforeRemove' );
const usersSvc = require( '../users' );
const activitiesSvc = require( '../activities' );
const controlDataSvc = require( '../legacy' ).controlData;
const fallbackContextGet = require( './lib/fallbackContextGet' );

module.exports = async ( ae, context ) => {

  log( 'will remove agenda-event %j', ae, { context } );

  const { agenda, event } = await fallbackContextGet( 'beforeRemove', ae, context );
  let user;

  if ( ae.state === 2 ) {

    try {
      await controlDataSvc.remove( ae );
    } catch ( e ) {
      log( 'error', 'control data remove failed', e );
    }

  }

  if ( context.userUid ) {
    try {
      user = await usersSvc.get( context.userUid );
    } catch ( e ) {
      return log( 'error', new VError( e, 'Error to get user %s', context.userUid ) );
    }

    if ( !user || !agenda || !event ) {
      return log( 'error', new VError( {
        info: { user, agenda, event }
      }, 'An entity is missing for add activity' ) );
    }

    try {
      if ( context.deletion && agenda.uid === event.agendaUid ) {
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
        log( 'error', 'Error to add activity event.delete or agenda.removeEvent in feed event:%s', event.uid, err );
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
