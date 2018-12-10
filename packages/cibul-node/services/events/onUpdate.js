"use strict";

const _ = require( 'lodash' );

const { promisify } = require( 'util' );
const VError = require( 'verror' );
const activitiesSvc = require( '@openagenda/activities' );
const usersSvc = require( '@openagenda/users' );
const agendasSvc = require( '@openagenda/agendas' );
const log = require( '@openagenda/logs' )( 'events/interfaces/onUpdate' );
const eventSearch = require( '../eventSearch' );

module.exports = ( before, after, context ) => {

  log( 'info', 'updated event %s', after.uid, { context } );

  if ( !after.draft ) {

    eventSearch.events.batch.update( after, context ); // context should have agendaUid && updateSearchIndex options

    _registerActivity( before, after, context );

  }


}


async function _registerActivity( before, after, context ) {

  let user;
  let agenda;

  if ( !_.get( context, 'userUid' ) ) {

    log( 'warn', 'userUid is not set in context, will not register activity' );

    return;

  }

  try {

    user = await usersSvc.get( context.userUid );

  } catch ( e ) {

    return log( 'error', new VError( e, 'Error to get user %s', context.userUid ) );

  }

  try {

    agenda = await promisify( agendasSvc.get )( { uid: context.agendaUid }, { private: null } );

  } catch ( e ) {

    return log( 'error', new VError( e, 'Error to get agenda %s', context.agendaUid ) );

  }

  activitiesSvc.feed( { entityType: 'event', entityUid: after.uid } ).activities.add( {
    actor: 'user:' + user.uid,
    verb: 'event.update',
    object: 'event:' + after.uid,
    target: 'agenda:' + agenda.uid,
    store: {
      labels: {
        actor: user.fullName,
        object: before.title,
        target: agenda.title
      }
    }
  }, err => {

    if ( err ) {

      log( 'error', new VError( err, 'could not add activity' ) );

    }

  } );

}
