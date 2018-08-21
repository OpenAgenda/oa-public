"use strict";

const { promisify } = require( 'util' );
const VError = require( 'verror' );
const activitiesSvc = require( '@openagenda/activities' );
const usersSvc = require( '@openagenda/users' );
const agendasSvc = require( '@openagenda/agendas' );
const eventsSvc = require( '@openagenda/events' );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/beforeRemove' );

module.exports = ( ae, context ) => {

  log( 'will remove agenda-event %j', ae, { context } );

  Promise.resolve()
    .then( async () => {

      // If it's a DELETE:                  context.userUid !== null && context.agendaUid !== null
      // If it's a REMOVE from origin:      context.userUid !== null && context.agendaUid === null
      // If it's a REMOVE from elsewhere:   context.userUid === null && context.agendaUid !== null

      let user;
      let agenda;
      let event;

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
        event = await eventsSvc.get( { uid: ae.eventUid }, { deleted: true } );
      } catch ( e ) {
        return log( 'error', new VError( e, 'Error to get event %s', ae.eventUid ) );
      }

      if ( !user || !agenda || !event ) {
        return log( 'error', new VError( 'An entity is missing for add activity', { user, agenda, event } ) );
      }

      activitiesSvc.feed( { entityType: 'event', entityUid: event.uid } ).activities.add( {
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
      }, err => {

        if ( err ) log( 'error', 'Error to add activity agenda.removeEvent in feed event:%s', event.uid );

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

}
