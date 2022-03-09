import { promisify } from 'util';
import _ from 'lodash';
import VError from 'verror';
import queueLib from '@openagenda/queue';
import logs from '@openagenda/logs';

const log = logs('inboxes/tasks/sync');

function upStats(stats, key) {
  if (stats) {
    _.set(stats, key, _.get(stats, key, 0) + 1);
  }
}

/*
 * - sync route per agenda
 * - check on admin/stats page
 * - weekly complete task
 * */

export async function syncUser(svc, user, stats) {
  // create inbox
  const inboxIdentifiers = { type: 'user', identifier: user.uid };
  const inbox = await new svc.Inbox(inboxIdentifiers).get({
    createOnNull: false,
  });

  if (!inbox.data) {
    await inbox.create(inboxIdentifiers);
    upStats(stats, 'userInboxesCreated');
    log('info', 'Inbox %j is created', inboxIdentifiers);
  }

  // add InboxUser
  const inboxUserIdentifiers = { userUid: user.uid };
  const inboxUser = await inbox.users.get(inboxUserIdentifiers);

  if (!inboxUser.data) {
    await inbox.users.add({ userUid: user.uid });
    upStats(stats, 'inboxUsersAdded');
    log(
      'info',
      'InboxUser %j is added to inbox %j',
      inboxUserIdentifiers,
      inboxIdentifiers
    );
  }
}

export async function syncAgenda(svc, agenda, stats) {
  const { services } = svc.config;

  const membersSvc = services.members();
  const usersSvc = services.users();

  // create inbox
  const inboxIdentifiers = { type: 'agenda', identifier: agenda.uid };
  const inbox = await new svc.Inbox(inboxIdentifiers).get({
    createOnNull: false,
  });

  if (!inbox.data) {
    await inbox.create(inboxIdentifiers);
    upStats(stats, 'agendaInboxesCreated');
    log('info', 'Inbox %j is created', inboxIdentifiers);
  }

  // add InboxUsers
  const limit = 200;
  let pos = 0;
  let result;
  const members = [];

  const shList = () => membersSvc.list(
    {
      agendaUid: agenda.uid,
      // credentials: [ 'administrator', 'moderator' ],
      deletedUser: false,
    },
    { offset: pos, limit }
    // { detailed: true }
  );

  while ((result = await shList())) {
    if (!result.length) break;
    pos += result.length;

    Array.prototype.push.apply(members, result);
  }

  pos = 0;
  const users = [];
  const userUids = _.map(members, 'userUid');

  while (
    (result = await usersSvc.find({
      query: {
        uid: {
          $in: userUids,
        },
        $skip: pos,
        $limit: limit,
      },
      removed: null,
    }))
  ) {
    if (!result.length) break;
    pos += limit;

    Array.prototype.push.apply(users, result);
  }

  for (const member of members) {
    const inboxUserIdentifiers = { userUid: member.userUid };

    if (!member.deletedUser && member.userUid) {
      const inboxUser = await inbox.users.get(inboxUserIdentifiers);
      const isAdminMod = [2, 3].includes(parseInt(member.role, 10));

      if (isAdminMod && !inboxUser.data) {
        await inbox.users.add(inboxUserIdentifiers);
        upStats(stats, 'inboxUsersAdded');
        log(
          'info',
          'InboxUser %j is added to inbox %j',
          inboxUserIdentifiers,
          inboxIdentifiers
        );
      } else if (isAdminMod && inboxUser.data && inboxUser.data.leftAt) {
        await inbox.users.remove(inboxUserIdentifiers);
        await inbox.users.add(inboxUserIdentifiers);
        upStats(stats, 'inboxUsersUpdated');
        log(
          'info',
          'InboxUser %j is updated in inbox %j',
          inboxUserIdentifiers,
          inboxIdentifiers
        );
      } else if (!isAdminMod && inboxUser.data && !inboxUser.data.leftAt) {
        await inbox.users.remove(inboxUserIdentifiers);
        upStats(stats, 'inboxUsersRemoved');
        log(
          'info',
          'InboxUser %j is removed to inbox %j',
          inboxUserIdentifiers,
          inboxIdentifiers
        );
      }
    }
  }

  // remove members who left
  pos = 0;
  const inboxUsers = [];

  while (
    ({ data: result } = await inbox.users.list({ leftAt: false }, pos, limit))
  ) {
    if (!result.length) break;
    pos += limit;

    Array.prototype.push.apply(inboxUsers, result);
  }

  for (const inboxUser of inboxUsers) {
    const member = members.find(v => v.userUid === inboxUser.userUid);
    if (!member) {
      const inboxUserIdentifiers = { userUid: inboxUser.userUid };
      await inbox.users.remove(inboxUserIdentifiers);
      upStats(stats, 'inboxUsersRemoved');
      log(
        'info',
        'InboxUser %j is removed to inbox %j',
        inboxUserIdentifiers,
        inboxIdentifiers
      );
    }
  }
}

export async function defineJob(config, q, stats) {
  const { services } = config;

  const agendasSvc = services.agendas();
  const usersSvc = services.users();
  const agendasList = promisify(agendasSvc.list);

  const limit = 200;
  let pos = 0;
  let users;

  while (
    (users = await usersSvc.find({ query: { $skip: pos, $limit: limit } }))
  ) {
    if (!users.length) break;
    pos += users.length;

    log('info', 'users %d-%d queued to sync', pos - users.length, pos);

    for (const user of users) {
      upStats(stats, 'usersToSync');
      await q({ user });
    }
  }

  log('info', 'Total of %d users queued to sync', stats.usersToSync);

  pos = 0;
  let agendas;

  while (
    (agendas = await agendasList(pos, limit, { private: null, internal: true }))
  ) {
    if (!agendas.length) break;
    pos += agendas.length;

    log('info', 'agendas %d-%d queued to sync', pos - agendas.length, pos);

    for (const agenda of agendas) {
      upStats(stats, 'agendasToSync');
      await q({ agenda });
    }
  }

  log('info', 'Total of %d agendas queued to sync', stats.agendasToSync);
}

export async function processJob(svc, data, stats) {
  if (data.user) {
    await syncUser(svc, data.user, stats);
  }

  if (data.agenda) {
    await syncAgenda(svc, data.agenda, stats);
  }
}

export default async function syncTask(svc) {
  const { queues, redis } = svc.config;

  const q = queueLib(queues.inboxesSync, { redis });
  const stats = {
    usersToSync: 0,
    agendasToSync: 0,
    userInboxesCreated: 0,
    agendaInboxesCreated: 0,
    inboxUsersAdded: 0,
    inboxUsersUpdated: 0,
    inboxUsersRemoved: 0,
  };

  if (!(await q.len())) {
    try {
      await defineJob(svc.config, q, stats);
    } catch (e) {
      return log('error', 'Error on jobs definition', e);
    }
  }

  let data;
  let i = 0;
  const total = await q.len();

  while ((data = await q.pop())) {
    try {
      log('Process job n°%d/%d', i + 1, total);
      await processJob(svc, data, stats);
    } catch (e) {
      log(
        'error',
        'Error on sync process: job n°%d:\n%j',
        i + 1,
        data,
        VError.fullStack(e)
      );
    }

    i += 1;
  }

  log('info', stats);
}
