"use strict";

const agendas = require( '@openagenda/agendas' );
const invitations = require( '@openagenda/invitations' );
const { Inbox } = require( '@openagenda/inboxes' );
const log = require( '@openagenda/logs' )( 'services/members/onCreate' );
const app = require( '../../app' );
const activities = require( '../activities' );
const controlDataSvc = require( '../legacy' ).controlData;
const {
  isSuperiorOrEqualTo
} = require( '@openagenda/members' ).utils.compareRoles;

const { send, sendInvitation } = require( './lib/mail' );

module.exports = async ( config, member, context ) => {
  const usersSvc = app.service( '/users' );

  log( 'created', member );

  try {
    const agenda = await agendas.get( {
      uid: member.agendaUid
    }, { private: null } );

    if ( !agenda ) throw new Error( 'Agenda not found' );

    const user = member.userUid ? await usersSvc.findOne( {
      query: { uid: member.userUid },
      removed: null
    } ) : null;

    if ( !user && member.userUid ) throw new Error( 'User not found' );

    if ( member.userUid ) {
      return _memberIsExistingUser( config, { member, user, agenda, context } );
    } else {
      return _memberIsInvitedNonUser( config, { member, agenda, context } );
    }

  } catch ( e ) {
    log( 'error', 'failed', { member, exception: e } );
  }
}

async function _memberIsExistingUser( { member, user, agenda, context } ) {
  const usersSvc = app.service( '/users' );

  log( 'member is existing user', member );

  if ( user.isNew ) {
    await usersSvc.setNewFlag( user.uid, { isNew: false } );
  }

  try {
    controlDataSvc.memberSet( {
      agendaUid: agenda.uid,
      userUid: user.uid,
      role: member.role
    } );
  } catch ( e ) {
    log( 'error', 'could not set member in control data', member, e );
  }

  const isAdminMod = isSuperiorOrEqualTo( member.role, 'moderator' );
  if ( isAdminMod ) {
    try {
      await new Inbox( {
        type: 'agenda',
        identifier: agenda.uid
      } ).users.add( {
        userUid: user.uid
      } );
    } catch ( e ) {
      log( 'error', 'could not add member to agenda inbox', e );
    }
  }

  const userFeedId = { entityType: 'user', entityUid: user.uid };
  const agendaFeedId = { entityType: 'agenda', entityUid: agenda.uid }
  try {
    await activities.feed( userFeedId )
      .follow( agendaFeedId, { credential: member.role } );
  } catch ( e ) {
    log( 'error', 'could not make user feed follow agenda feed', member.id );
  }

  const senderUser = await usersSvc.findOne( {
    query: { uid: _.get( context, 'sender.userUid' ) },
    removed: null
  } );

  if ( !senderUser ) throw new Error( 'Sender user not found' );

  await send( config, {
    member,
    agenda,
    context
  } );

  try {
    await activities.feed( {
      entityType: 'agenda',
      entityUid: agenda.uid
    } ).activities.add( {
      actor: 'user:' + senderUser.uid,
      verb: 'agenda.addMember',
      object: 'user:' + user.uid,
      target: 'agenda:' + agenda.uid,
      store: {
        labels: {
          actor: context.sender.memberName,
          object: _.get( member, 'custom.contactName' ) || user.fullName,
          target: agenda.title
        },
        credential: member.role
      }
    } );
  } catch ( e ) {
    log( 'error', 'could not add addMember activity to agenda feed', agenda, member, e );
  }
}

async function _memberIsInvitedNonUser( config, { member, agenda, context } ) {
  log( 'member is not existing user, is invited' );

  const { invitation } = await invitations.assign( {
    email: member.custom.email
  }, 'linkMember', [ member, context ] );

  return sendInvitation( config, { invitation, member, context, agenda } );
}
