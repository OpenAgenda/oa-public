"use strict";

const _ = require( 'lodash' );

const activities = require( '@openagenda/activities' );
const agendas = require( '@openagenda/agendas' );
const users = require( '@openagenda/users' );
const { Inbox } = require( '@openagenda/inboxes' );
const invitations = require( '@openagenda/invitations' );
const activitiesSvc = require( '@openagenda/activities' );
const { isSuperiorToOrEqual } = require( '@openagenda/members' ).utils.compareRoles;

const controlDataSvc = require( '../legacy' ).controlData;
const log = require( '@openagenda/logs' )( 'services/members/onRemove' );

module.exports = async ( membersSvc, member, context ) => {

  log( 'removed', member );

  try {

    const { user } = context;
    const agenda = await agendas.get( { uid: member.agendaUid }, { private: null } );

    if ( !member.userUid ) {
      log( 'removed member is not linked to a user account', member );
      return;
    }

    const memberUser = await users.findOne( {
      query: { uid: member.userUid }
    } );

    if ( !memberUser ) {
      throw new Error( 'User not found' );
    }

    const userMember = await membersSvc.get( {
      agendaUid: agenda.uid,
      userUid: user.uid
    } );

    try {
      await addMemberRemoveActivity( { user, member, agenda, userMember, memberUser } );
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
    return v.name === 'linkStakeholder' && v.params[ 0 ].id === member.id;
  } );

  if ( !action ) return;

  if ( invitation.data.actions.length > 1 ) {
    await invitation.removeAction( action.id );
  } else {
    await invitation.remove();
  }

}

async function addMemberRemoveActivity( { user, member, agenda, userMember, memberUser } ) {
  await activitiesSvc.feed( {
    entityType: 'agenda',
    entityUid: agenda.uid
  } ).activities.add( {
    actor: 'user:' + user.uid,
    verb: 'agenda.removeMember',
    object: 'user:' + memberUser.uid,
    target: 'agenda:' + agenda.uid,
    store: {
      labels: {
        actor: userMember.custom.contactName || user.fullName,
        object: member.custom.contactName || memberUser.fullName,
        target: agenda.title
      },
      credential: member.role
    }
  } );
}
