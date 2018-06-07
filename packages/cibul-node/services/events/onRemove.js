"use strict";

const { promisify } = require( 'util' );
const agendasSvc = require( '@openagenda/agendas' );
const activitiesSvc = require( '@openagenda/activities' );
const usersSvc = require( '@openagenda/users' );
const log = require( '@openagenda/logs' )( 'events/interfaces/onRemove' );
const eventSearch = require( '../eventSearch' );

module.exports = async ( event, context ) => {

  log( 'info', 'removed event %s', event.uid, { context } );

  eventSearch.events.remove( event.uid, context ); // context should have agendaUid

  // TODO activities: event.delete in feed event -> feed agenda source (!!! filtered for agenda source)

 /* const user = await usersSvc.get( context.userUid );
  const agenda = await promisify( agendasSvc.get )( { uid: context.agendaUid }, { private: null } );

  console.log( 'EVENT', event );
  console.log( 'USER', user );
  console.log( 'AGENDA WHERE L\'EVENT A ÉTÉ DELETÉ', agenda );

  if ( agenda ) {

    activitiesSvc.feed( { entityType: 'event', entityUid: event.uid } ).activities.add( {
      actor: 'user:' + context.userUid,
      verb: 'event.delete',
      object: 'event:' + event.uid,
      target: 'agenda:' + context.agendaUid,
      store: {
        labels: {
          actor: user.fullName,
          object: event.title,
          target: agenda.title
        }
      }
    }, () => {
      //
    } );

  } */

}