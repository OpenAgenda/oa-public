const log = require( '@openagenda/logs' )( 'activities/task' );
const activitiesSvc = require( '@openagenda/activities' );
const agendasSvc = require( '@openagenda/agendas' );
const usersSvc = require( '@openagenda/users' );
const VError = require( 'verror' );
const eventSvc = require( '../services/event' );
const coms = require( '../lib/coms' );
const config = require( '../config' );

const loggerConfig = {
  debug: {
    prefix: 'oa:'
  },
  token: process.env.NODE_ENV === 'production' ? '8d66d66a-58ce-42b6-ab21-7805b075ba48' : null
};

log.setConfig( loggerConfig );

module.exports = function () {

  coms.subscribe( config.mainChannel, ( err, action ) => {

    if ( err ) return;

    switch ( action.name ) {

      case 'event.create':
      case 'event.update':
      case 'event.remove':

        return _onEventActivity( action );

    }

  } );

}


function _onEventActivity( action ) {

  log( 'info', action.values.review_id ? '-- read event %s activity for agenda %s --' : '-- read event %s activity --', action.values.id, action.values.review_id );

  // untested code ( event deletion case ) - fixing event deletion exception with error handling.

  eventSvc.get( { id: action.values.id }, ( err, event ) => {

    if ( err ) return log( 'error', 'could not fetch event %s: %s', action.values.id, err );

    if ( !event ) return log( 'error', 'no event could be loaded for event id %s', action.values.id );

    const type = event.createdAt.toString() === event.updatedAt.toString() ? 'create' : 'update';
    const userId = type === 'create' ? event.ownerId : action.values.user_id;

    // If is real update, not a publishing or unpublishing
    if ( type === 'update' && !action.values.type ) {

      agendasSvc.get( action.values.review_id, { private: null }, ( err, agenda ) => {

        if ( err ) return log( 'error', 'Error to get agenda %s', action.values.review_id );

        usersSvc.get( userId, ( err, user ) => {

          if ( err ) return log( 'error', 'Error to get user %s', userId );

          if ( !user || !agenda ) {
            return log( 'error', 'Error to get user %s or agenda %s', JSON.stringify( user ), JSON.stringify( agenda ) );
          }

          activitiesSvc.feed( { entityType: 'event', entityUid: event.uid } ).activities.add( {
            actor: 'user:' + user.uid,
            verb: 'event.update',
            object: 'event:' + event.uid,
            target: 'agenda:' + agenda.uid,
            store: {
              labels: {
                actor: user.full_name,
                object: event.title,
                target: agenda.title
              }
            }
          }, err => {

            if ( err ) {
              log( 'error', new VError( err, 'could not add activity' ) );
            }

          } );

        } );

      } );

    } else if ( action.values.type === 'event.remove' ) { // action.values.agendaId & action.values.userId

      agendasSvc.get( action.values.agendaId, ( err, agenda ) => {

        if ( err ) return log( 'error', 'Error to get agenda %s', action.values.agendaId );

        usersSvc.get( action.values.userId, ( err, user ) => {

          if ( err ) return log( 'error', 'Error to get user %s', action.values.userId );

          if ( !user ) return log( 'error', 'could not load user of id %s', action.values.userId );

          activitiesSvc.feed( { entityType: 'event', entityUid: event.uid } ).activities.add( {
            actor: 'user:' + user.uid,
            verb: 'agenda.removeEvent',
            object: 'event:' + event.uid,
            target: 'agenda:' + agenda.uid,
            store: {
              labels: {
                actor: user.full_name,
                object: event.title,
                target: agenda.title
              }
            }
          }, err => {

            if ( err ) return log( 'error', 'Error to add activity agenda.removeEvent in feed event:%s', event.uid );

            activitiesSvc.feed( { entityType: 'agenda', entityUid: agenda.uid } )
              .unfollow( { entityType: 'event', entityUid: event.uid }, err => {

                if ( err ) {
                  return log( 'error',
                    'Error when feed agenda:%s have tried to unfollow feed event:%s', agenda.uid, event.uid
                  );
                }

              } );

          } );

        } );

      } );

    }

  } );

}
