"use strict";

const _ = require( 'lodash' );

const activities = require( '@openagenda/activities' );
const agendas = require( '@openagenda/agendas' );
const users = require( '@openagenda/users' );
const { Inbox } = require( '@openagenda/inboxes' );
const invitations = require( '@openagenda/invitations' );
const { isSuperiorToOrEqual } = require( '@openagenda/members' ).utils.compareRoles;

const controlDataSvc = require( '../legacy' ).controlData;
const log = require( '@openagenda/logs' )( 'services/members/onRemove' );

module.exports = async member => {

  log( 'removed', member );

  try {

    const agenda = await agendas.get( { uid: member.agendaUid }, { private: null } );

    if ( !member.userUid ) {
      log( 'removed member is not linked to a user account', member );
      return;
    }

    const user = await users.findOne( {
      query: { uid: member.userUid }
    } );

    if ( !user ) throw new Error( 'User not found' );

    try {
      await controlDataSvc.memberRemove( {
        agendaUid: agenda.uid,
        userUid: user.uid
      } );
    } catch ( e ) {
      log( 'error', 'failed removing member from control data', { member, exception: e } );
    }

    try {
      await activities.feed( {
        entityType: 'user',
        entityUid: user.uid
      } ).unfollow( {
        entityType: 'agenda',
        entityUid: agenda.uid
      } );
    } catch ( e ) {
      log( 'error', 'failed user unfollow on agenda', { member, exception: e } );
    }

    if ( isSuperiorToOrEqual( member.role, 'moderator' ) ) {
      try {
        await new Inbox( {
          type: 'agenda',
          identifier: agenda.uid
        } ).users.remove( {
          userUid: user.uid
        } );
      } catch ( e ) {
        log( 'error', 'failed to remove user from agenda inbox', { member, exception: e } );
      }
    }

    if ( _.get( member, 'custom.email' ) ) {
      try {
        await _removeInvitationsToMember( member );
      } catch ( e ) {
        log( 'error', 'failed to remove invitations made to member', { member, exception: e } );
      }
    }

  } catch ( e ) {
    log( 'error', 'failed', { member, exception: e } );
  }

}


async function _removeInvitationsToMember( member ) {

  const { invitation } = await invitations.get( { email: member.custom.email } );

  if ( !invitation ) return;

  const action = invitation.data.actions.find( v => {
    return v.name === 'linkStakeholder' && v.params[ 0 ].id === member.id;
  } );

  if ( !action ) return;

  if ( invitation.data.actions.length > 1 ) {
    await invitation.removeAction( action.id );
  } else {
    await invitation.remove();
  }

}
