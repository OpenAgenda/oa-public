"use strict";

const agendaEvents = require( '@openagenda/agenda-events' );
const events = require( '@openagenda/events' );

const activities = require( '../../activities' );
const legacyEventSearch = require( '../../elasticsearch' );

const log = require( '@openagenda/logs' )( 'services/members/transferEvent' );

module.exports = async ( event, member ) => {
  log( 'processing event to member', event.uid, member.id );

  const previousOwnerUid = event.ownerUid;

  await agendaEvents(member.agendaUid).update(event.uid, {
    userUid: member.userUid
  }, { protected: false, transferToLegacy: true });

  await events.update( { uid: event.uid }, {
    ownerUid: member.userUid
  }, { protected: false, transferToLegacy: true } );

  try {
    await legacyEventSearch.updateEvent( _.pick( event, [ 'uid' ] ) );
  } catch ( e ) {
    log( 'error', 'could not update legacy search', event.slug );
  }

  try {
    await _feedFollow( false, previousOwnerUid, event.uid );
  } catch ( e ) {
    log( 'error', 'failed to update current owner feed', e );
  }

  try {
    await _feedFollow( true, member.userUid, event.uid );
  } catch ( e ) {
    log( 'error', 'failed to update transferred to user feed', e );
  }

}

function _feedFollow( follow, userUid, eventUid ) {
  return activities.feed( {
    entityType: 'user',
    entityUid: userUid
  } )[ follow ? 'follow' : 'unfollow' ]( {
    entityType: 'event',
    entityUid: eventUid
  } );
}
