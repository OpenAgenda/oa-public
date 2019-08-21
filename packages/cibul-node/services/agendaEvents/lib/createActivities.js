"use strict";

const activitiesSvc = require( '../../activities' );

const log = require( '@openagenda/logs' )( 'agendaEvents/createActivities' );

module.exports = async ( { agenda, event, user }, before, after ) => {
  log( 'processing' );

  const hasUnpublished = before.state === 2 && after.state !== 2;
  const hasPublished = after.state === 2 && before.state !== 2;

  if ( hasUnpublished || hasPublished ) {
    log( before.state === 2 ? 'unpublishing' : 'publishing' );
    return activitiesSvc.feed( {
      entityType: 'event',
      entityUid: event.uid
    } ).activities.add( {
      actor: 'user:' + user.uid,
      verb: 'agenda.' + ( after.state === 2 ? 'publish' : 'unpublish' ) + 'Event',
      object: 'event:' + event.uid,
      target: 'agenda:' + agenda.uid,
      store: {
        labels: {
          actor: user.fullName,
          object: event.title,
          target: agenda.title
        },
        // origin is not always set. When the event was created by script for example.
        originAgendaUid: event.origin ? event.origin.uid : null
      }
    } );
  } else if ( before.state !== after.state ) {
    return activitiesSvc.feed( {
      entityType: 'agenda',
      entityUid: agenda.uid
    } ).activities.add( {
      actor: 'user:' + user.uid,
      verb: 'agenda.changeEventState',
      object: 'event:' + event.uid,
      target: 'agenda:' + agenda.uid,
      store: {
        labels: {
          actor: user.fullName,
          object: event.title,
          target: agenda.title
        },
        oldState: before.state,
        newState: after.state
      }
    } );
  }
}
