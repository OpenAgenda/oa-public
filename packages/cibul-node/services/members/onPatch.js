"use strict";

const _ = require( 'lodash' );

const activities = require( '@openagenda/activities' );
const agendas = require( '@openagenda/agendas' );
const controlDataSvc = require( '../legacy' ).controlData;
const { Inbox } = require( '@openagenda/inboxes' );
const invitations = require( '@openagenda/invitations' );
const log = require( '@openagenda/logs' )( 'services/members/onPatch' );
const users = require( '@openagenda/users' );

const { sendInvitation } = require( './lib/mail' );

const {
  isSuperiorOrEqualTo
} = require( '@openagenda/members' ).utils.compareRoles;

module.exports = async ( config, before, member, context ) => {
  log( 'patched', member );

  try {

    const agenda = await agendas.get( { uid: member.agendaUid }, { private: null } );

    if ( !agenda ) throw new Error( 'Agenda not found' );

    const user = member.userUid ? await users.findOne( {
      query: { uid: member.userUid },
      removed: null
    } ) : null;

    if ( !user && member.userUid ) throw new Error( 'User not found' );

    const senderUser = await users.findOne( {
      query: { uid: _.get( context, 'sender.userUid' ) },
      removed: null
    } );

    const agendaInbox = new Inbox( {
      type: 'agenda',
      identifier: agenda.uid
    } );

    const isNewMember = member.userUid && !before.userUid;
    const hasChangedRole = member.userUid && ( before.role !== member.role );
    const isPromotedToAdminMod = hasChangedRole
      && !isSuperiorOrEqualTo( before.role, 'moderator' )
      && isSuperiorOrEqualTo( member.role, 'moderator' );
    const isDemotedToContributor = hasChangedRole
      && isSuperiorOrEqualTo( before.role, 'moderator' )
      && !isSuperiorOrEqualTo( member.role, 'moderator' );
    const isDeleted = member.deletedUser && !before.deletedUser;
    const isInvited = !isDeleted && !member.userUid;
    const emailChanged = before.custom.email !== member.custom.email;

    if ( isNewMember ) {
      log( 'user is a newly associated member' );
      if ( !senderUser ) throw new Error( 'Sender user not found' );
      try {
        await _onNewMember( { agenda, user, senderUser, context, member } );
      } catch ( e ) {
        log( 'error', 'failed to register new member', e );
      }
    } else if ( hasChangedRole ) {
      log( 'member has changed role' );
      try {
        await _onRoleChange( { user, before, member, agenda, context, senderUser } );
      } catch ( e ) {
        log( 'error', 'failed to process role change', e );
      }
    }

    if ( isDemotedToContributor || isDeleted ) {
      log( 'demotion or deletion' );
      try {
        await agendaInbox.users.remove( {
          userUid: user.uid
        } );
      } catch ( e ) {
        log( 'error', 'failed to remove user from agenda inbox', { member, exception: e } );
      }
    } else if ( isPromotedToAdminMod ) {
      log( 'promotion' );
      try {
        await agendaInbox.users.add( {
          userUid: user.uid
        } );
      } catch ( e ) {
        log( 'error', 'failed to add user to agenda inbox', { member, exception: e } );
      }
    }

    let invitation;

    // handle invitations
    if ( before.custom.email && ( isDeleted || emailChanged ) ) {
      const getResult = await invitations.get( { email: before.custom.email } );
      invitation = getResult.invitation;
    }

    log( invitation ? 'an invitation is linked to member' : 'no invitation is linked to member', invitation, member );

    if ( invitation && isDeleted ) {
      try {
        await invitations.remove( { email: before.custom.email } )
      } catch ( e ) {
        log( 'error', 'failed to remove invitation', e );
      }
    } else if ( invitation && emailChanged ) {
      try {
        invitation.email = member.custom.email;
        await invitation.save();
        await sendInvitation( config, { invitation, member, context, agenda } );
      } catch ( e ) {
        log( 'error', 'failed to update invitation', e );
      }
    }

  } catch ( e ) {
    log( 'error', 'failed', { member, exception: e } );
  }
}

async function _onRoleChange( { user, before, member, agenda, context, senderUser } ) {

  const userFeed = activities.feed( {
    entityType: 'user',
    entityUid: user.uid
  } );

  const agendaFeed = activities.feed( {
    entityType: 'agenda',
    entityUid: agenda.uid
  } );

  await userFeed.unfollow( {
    entityType: 'agenda',
    entityUid: agenda.uid
  } );

  await userFeed.follow( {
    entityType: 'agenda',
    entityUid: agenda.uid
  }, { credential: member.role } );

  await agendaFeed.activities.add( {
    actor: 'user:' + senderUser.uid,
    verb: 'agenda.setMemberRole',
    object: 'user:' + user.uid,
    target: 'agenda:' + agenda.uid,
    store: {
      labels: {
        actor: context.sender.memberName,
        object: member.custom.contactName || user.fullName,
        target: agenda.title
      },
      beforeCredential: before.role,
      credential: member.role
    }
  } );

}

async function _onNewMember( { agenda, user, senderUser, context, member } ) {

  if ( user.isNew ) {
    await users.setNewFlag( user.uid, false );
  }

  try {
    await controlDataSvc.memberSet( {
      agendaUid: agenda.uid,
      userUid: user.uid,
      role: member.role
    } );
  } catch ( e ) {
    log( 'error', 'could not set member in control data', member, e );
  }

  await activities.feed( {
    entityType: 'user',
    entityUid: user.uid
  } ).follow( {
    entityType: 'agenda',
    entityUid: agenda.uid
  }, {
    credential: member.role
  } );

  await activities.feed( {
    entityType: 'agenda',
    entityUid: agenda.uid
  } ).activities.add( {
    actor: 'user:' + user.uid,
    verb: 'agenda.acceptInvitation',
    object: 'user:' + senderUser.uid,
    target: 'agenda:' + agenda.uid,
    store: {
      labels: {
        actor: member.custom.contactName || user.fullName,
        object: context.sender.memberName,
        target: agenda.title
      },
      credential: member.role
    }
  } );

}
