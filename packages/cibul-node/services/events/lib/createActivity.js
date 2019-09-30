"use strict";

const _ = require( 'lodash' );
const { diff } = require( 'deep-diff' );
const VError = require( 'verror' );

const agendasSvc = require( '@openagenda/agendas' );
const usersSvc = require( '../../users' );
const activitiesSvc = require( '../../activities' );

const log = require( '@openagenda/logs' )( 'events/createActivity' );

module.exports = async ( before, after, context ) => {
  log( 'processing' );

  if (!activitiesSvc.feed) {
    return log('warn', 'activities service is not initialized');
  }

  let user;
  let agenda;

  if ( !_.get( context, 'userUid' ) ) {
    return log( 'warn', 'userUid is not set in context, will not register activity' );
  }

  try {
    user = await usersSvc.get( context.userUid );
  } catch ( e ) {
    return log( 'error', new VError( e, 'Error to get user %s', context.userUid ) );
  }

  try {
    agenda = await agendasSvc.get( { uid: context.agendaUid }, { private: null } );
  } catch ( e ) {
    return log( 'error', new VError( e, 'Error to get agenda %s', context.agendaUid ) );
  }

  await activitiesSvc.feed( { entityType: 'event', entityUid: after.uid } ).activities.add( {
    actor: 'user:' + user.uid,
    verb: 'event.update',
    object: 'event:' + after.uid,
    target: 'agenda:' + agenda.uid,
    store: {
      labels: {
        actor: user.fullName,
        object: before.title,
        target: agenda.title
      },
      diff: diff(
        before,
        after,
        ( path, key ) => [ 'updatedAt', 'location' ].includes( key )
      )
    }
  } );

}
