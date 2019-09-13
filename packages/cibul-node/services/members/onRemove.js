"use strict";

const _ = require( 'lodash' );
const agendas = require( '@openagenda/agendas' );
const { Inbox } = require( '@openagenda/inboxes' );
const invitations = require( '@openagenda/invitations' );
const { isSuperiorToOrEqual } = require( '@openagenda/members' ).utils.compareRoles;
const log = require( '@openagenda/logs' )( 'services/members/onRemove' );

const activities = require( '../activities' );
const controlDataSvc = require( '../legacy' ).controlData;
const usersSvc = require( '../users' );

module.exports = async ( { members, activityQueue }, member, context ) => {
  log( 'removed', member );

  try {

    const { user } = context;
    const agenda = await agendas.get( { uid: member.agendaUid }, { private: null } );

    if ( !agenda ) throw new Error( 'Agenda not found' );

    if ( !member.userUid ) {
      log( 'removed member is not linked to a user account', member );
      return;
    }

    const memberUser = await usersSvc.findOne( {
      query: { uid: member.userUid }
    } );

    if ( !memberUser ) {
      throw new Error( 'User not found' );
    }

    const userMember = await members.get( {
      agendaUid: agenda.uid,
      userUid: user.uid
    } );

    try {
      await activityQueue( 'addMemberRemove', {
        user, member, agenda, userMember, memberUser
      } );
    } catch ( e ) {
      log( 'error', 'failed adding activity of type agenda.removeMember', { member, exception: e } );
    }

    try {
      await controlDataSvc.memberRemove( {
        agendaUid: agenda.uid,
        userUid: memberUser.uid
      } );
    } catch ( e ) {
      log( 'error', 'failed removing member from control data', { member, exception: e } );
    }

    try {
      await activities.feed( {
        entityType: 'user',
        entityUid: memberUser.uid
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
          userUid: memberUser.uid
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
    return v.name === 'linkMember' && v.params[ 0 ].id === member.id;
  } );

  if ( !action ) return;

  if ( invitation.data.actions.length > 1 ) {
    await invitation.removeAction( action.id );
  } else {
    await invitation.remove();
  }
}
