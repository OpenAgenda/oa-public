import { promisify, callbackify } from 'util';
import _ from 'lodash';
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
    usersInboxCreated: 0,
    agendasInboxCreated: 0,
    inboxUsersAdded: 0
  };

  if ( !await q.len() ) {
    try {
      await defineJob( stats, q );
    } catch ( e ) {
      return log( 'error', 'Error on jobs definition', e );
    }
  }

  let data;

  while ( data = await q.pop() ) {
    try {
      await processJob( stats, data );
    } catch ( e ) {
      log( 'error', 'Error on sync process: job n°%d:\n%o', i, data, e );
    }
  }

  log( 'info', '%d users inbox created', stats.usersInboxCreated );
  log( 'info', '%d agendas inbox created', stats.agendasInboxCreated );
  log( 'info', '%d inboxUsers added', stats.inboxUsersAdded );
}

export async function processJob( stats, data ) {
  if ( data.user ) {
    await syncUser( stats, data.user );
  }

  if ( data.agenda ) {
    await syncAgenda( stats, data.agenda );
  }
}

export async function defineJob( stats, q ) {
  const {
    agendas: agendasSvc,
    users: usersSvc
  } = services;

  const agendasList = promisify( agendasSvc.list );

  const limit = 200;
  let pos = 0;
  let users;

  while ( { users } = await usersSvc.list( pos, limit ) ) {
    if ( !users.length ) break;
    pos = pos + users.length;

    log( 'info', 'users %d-%d queued to sync', pos - users.length, pos );

    for ( const user of users ) {
      stats.usersToSync += 1;
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
      stats.agendasToSync += 1;
      await q( { agenda } );
    }
  }

  log( 'info', 'Total of %d agendas queued to sync', stats.agendasToSync );
}

async function syncUser( stats, user ) {
  // create Inbox
  const inboxIdentifiers = { type: 'user', identifier: user.uid };
  const Inbox = await new Inboxes( inboxIdentifiers ).get();

  if ( !Inbox.data ) {
    await Inbox.create();
    stats.usersInboxCreated += 1;
    log( 'info', 'Inbox %o is created', inboxIdentifiers );
  }

  // add InboxUser
  const inboxUserIdentifiers = { userUid: user.uid };
  const inboxUser = await Inbox.users.get( inboxUserIdentifiers );

  if ( !inboxUser.data ) {
    await Inbox.users.add( { userUid: user.uid } );
    stats.inboxUsersAdded += 1;
    log( 'info', 'InboxUser %o is added to inbox %o', inboxUserIdentifiers, inboxIdentifiers );
  }
}

async function syncAgenda( stats, agenda ) {
  const {
    stakeholders: stakeholdersSvc,
    users: usersSvc
  } = services;

  // create Inbox
  const inboxIdentifiers = { type: 'agenda', identifier: agenda.uid };
  const Inbox = await new Inboxes( inboxIdentifiers ).get();

  if ( !Inbox.data ) {
    await Inbox.create();
    stats.agendasInboxCreated += 1;
    log( 'info', 'Inbox %o is created', inboxIdentifiers );
  }

  // add InboxUsers
  const limit = 200;
  let pos = 0;
  let result;
  const stakeholders = [];

  const shList = () => promisify( stakeholdersSvc.agenda( agenda.id ).list )(
    { credentials: [ 'administrator', 'moderator' ] },
    pos,
    limit,
    { deletedUser: false }
  );

  while ( result = await shList() ) {
    if ( !result.length ) break;
    pos = pos + result.length;

    Array.prototype.push.apply( stakeholders, result );
  }

  pos = 0;
  const users = [];
  const userIds = _.map( stakeholders, 'userId' );

  while ( result = (await usersSvc.list( { id: userIds }, pos, limit, { removed: false } )).users ) {
    if ( !result.length ) break;
    pos = pos + limit;

    Array.prototype.push.apply( users, result );
  }

  for ( const user of users ) {
    const inboxUserIdentifiers = { userUid: user.uid };
    const inboxUser = await Inbox.users.get( inboxUserIdentifiers );

    if ( !inboxUser.data ) {
      await Inbox.users.add( { userUid: user.uid } );
      stats.inboxUsersAdded += 1;
      log( 'info', 'InboxUser %o is added to inbox %o', inboxUserIdentifiers, inboxIdentifiers );
    }
  }
}
