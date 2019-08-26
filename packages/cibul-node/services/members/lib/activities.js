"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'services/members/activities' );

const activities = require( '../../activities' );

module.exports = ( { queue } ) => {
  return {
    task: task.bind( null, queue )
  }
}


function task( queue ) {
  log( 'task' );

  queue.register( {
    addMemberRemove,
    addMemberCreate,
    addMemberRoleChange,
    addMemberAcceptInvitation
  } );

  queue.on( 'error', ( fn, args, error ) => log( 'error', fn, args, error ) );
  queue.on( 'execute', ( fn, args ) => log( fn, 'execute' ) );
  queue.on( 'success', ( fn, args, result ) => log( fn, 'success' ) );

  queue.run();
}

function addMemberCreate( { user, member, agenda, senderUser, context } ) {
  return activities.feed( {
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
}

function addMemberRemove( { user, member, agenda, userMember, memberUser } ) {
  return activities.feed( {
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

async function addMemberRoleChange( { user, before, member, agenda, context, senderUser } ) {
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

function addMemberAcceptInvitation( { agenda, user, senderUser, member, context } ) {
  return activities.feed( {
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
