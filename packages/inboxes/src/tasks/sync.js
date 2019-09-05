import { promisify, callbackify } from 'util';
import _ from 'lodash';
import VError from 'verror';
import queueLib from '@openagenda/queue';
import logs from '@openagenda/logs';
import { services, queues, redis } from '../config';
import Inboxes from '../';

const log = logs( 'inboxes/tasks/sync' );

/*
* - sync route per agenda
* - check on admin/stats page
* - weekly complete task
* */

export default async function syncTask() {
  const q = queueLib( queues.inboxesSync, { redis } );
  const stats = {
    usersToSync: 0,
    agendasToSync: 0,
    userInboxesCreated: 0,
    agendaInboxesCreated: 0,
    inboxUsersAdded: 0
  };

  if ( !await q.len() ) {
    try {
      await defineJob( q, stats );
    } catch ( e ) {
      return log( 'error', 'Error on jobs definition', e );
    }
  }

  let data;
  let i = 0;
  const total = await q.len();

  while ( data = await q.pop() ) {
    try {
      log( 'Process job n°%d/%d', i + 1, total );
      await processJob( data, stats );
    } catch ( e ) {
      log( 'error', 'Error on sync process: job n°%d:\n%j', i + 1, data, VError.fullStack( e ) );
    }

    i++;
  }

  log( 'info', '%d user inboxes created', stats.userInboxesCreated );
  log( 'info', '%d agenda inboxes created', stats.agendaInboxesCreated );
  log( 'info', '%d inboxUsers added', stats.inboxUsersAdded );
}

export async function defineJob( q, stats ) {
  const agendasSvc = services.agendas();
  const usersSvc = services.users();
  const agendasList = promisify( agendasSvc.list );

  const limit = 200;
  let pos = 0;
  let users;

  while ( { users } = (await usersSvc.find( { query: { $skip: pos, $limit: limit } } )).data ) {
    if ( !users.length ) break;
    pos = pos + users.length;

    log( 'info', 'users %d-%d queued to sync', pos - users.length, pos );

    for ( const user of users ) {
      upStats( stats, 'usersToSync' );
      await q( { user } );
    }
  }

  log( 'info', 'Total of %d users queued to sync', stats.usersToSync );

  pos = 0;
  let agendas;

  while ( agendas = await agendasList( pos, limit, { private: null, internal: true } ) ) {
    if ( !agendas.length ) break;
    pos = pos + agendas.length;

    log( 'info', 'agendas %d-%d queued to sync', pos - agendas.length, pos );

    for ( const agenda of agendas ) {
      upStats( stats, 'agendasToSync' );
      await q( { agenda } );
    }
  }

  log( 'info', 'Total of %d agendas queued to sync', stats.agendasToSync );
}

export async function processJob( data, stats ) {
  if ( data.user ) {
    await syncUser( data.user, stats );
  }

  if ( data.agenda ) {
    await syncAgenda( data.agenda, stats );
  }
}


export async function syncUser( user, stats ) {
  // create Inbox
  const inboxIdentifiers = { type: 'user', identifier: user.uid };
  const Inbox = await new Inboxes( inboxIdentifiers ).get( { createOnNull: false } );

  if ( !Inbox.data ) {
    await Inbox.create( inboxIdentifiers );
    upStats( stats, 'userInboxesCreated' );
    log( 'info', 'Inbox %j is created', inboxIdentifiers );
  }

  // add InboxUser
  const inboxUserIdentifiers = { userUid: user.uid };
  const inboxUser = await Inbox.users.get( inboxUserIdentifiers );

  if ( !inboxUser.data ) {
    await Inbox.users.add( { userUid: user.uid } );
    upStats( stats, 'inboxUsersAdded' );
    log( 'info', 'InboxUser %j is added to inbox %j', inboxUserIdentifiers, inboxIdentifiers );
  }
}

export async function syncAgenda( agenda, stats ) {
  const membersSvc = services.members();
  const usersSvc = services.users();

  // create Inbox
  const inboxIdentifiers = { type: 'agenda', identifier: agenda.uid };
  const Inbox = await new Inboxes( inboxIdentifiers ).get( { createOnNull: false } );

  if ( !Inbox.data ) {
    await Inbox.create( inboxIdentifiers );
    upStats( stats, 'agendaInboxesCreated' );
    log( 'info', 'Inbox %j is created', inboxIdentifiers );
  }

  // add InboxUsers
  const limit = 200;
  let pos = 0;
  let result;
  const stakeholders = [];

  const shList = () => membersSvc.list(
    {
      agendaUid: agenda.uid,
      credentials: [ 'administrator', 'moderator' ],
      deletedUser: false
    },
    { offset: pos, limit }
  );

  while ( result = await shList() ) {
    if ( !result.length ) break;
    pos = pos + result.length;

    Array.prototype.push.apply( stakeholders, result );
  }

  pos = 0;
  const users = [];
  const userIds = _.map( stakeholders, 'userId' );

  while ( result = (await usersSvc.find( {
    query: {
      id: {
        $in: userIds
      },
      $skip: pos,
      $limit: limit
    },
    removed: null
  } )).data ) {
    if ( !result.length ) break;
    pos = pos + limit;

    Array.prototype.push.apply( users, result );
  }

  for ( const user of users ) {
    const inboxUserIdentifiers = { userUid: user.uid };
    const inboxUser = await Inbox.users.get( inboxUserIdentifiers );

    if ( !inboxUser.data ) {
      await Inbox.users.add( { userUid: user.uid } );
      upStats( stats, 'inboxUsersAdded' );
      log( 'info', 'InboxUser %j is added to inbox %j', inboxUserIdentifiers, inboxIdentifiers );
    }
  }
}


function upStats( stats, key ) {
  if ( stats ) {
    _.set( stats, key, _.get( stats, key, 0 ) + 1 );
  }
}
