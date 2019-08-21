"use strict";

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
    addMemberRemoveActivity
  } );

  queue.on( 'error', ( fn, args, error ) => log( 'error', fn, args, error ) );
  queue.on( 'execute', ( fn, args ) => {} );
  queue.on( 'success', ( fn, args, result ) => log( fn, 'success' ) );

  queue.run();
}


async function addMemberRemoveActivity( { user, member, agenda, userMember, memberUser } ) {
  log( 'adding remove activity' );
  await activities.feed( {
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
  log( 'added remove activity' );
}
