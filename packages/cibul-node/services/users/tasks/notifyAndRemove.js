'use strict';

const logs = require('@openagenda/logs');
const promisifyRedis = require('@openagenda/utils/redis/promisify');

const log = logs('services/users/tasks/notifyAndRemove');

const storePrefix = 'inactiveUsers:';

const inactiveTime = ((365 * 3) - 30) * 24 * 60 * 60 * 1000;
const storeExpire = 60 * 60 * 24 * 30 * 2; // 2 months
const limit = 100;
const maxHandledUsers = 1000;

async function sendEmail(services, user, template, options = {}) {
  const {
    send: doSend = true
  } = options;

  const {
    mails,
    core
  } = services;

  if (!doSend) {
    log('sending is deactivated. Not sending %s to %s', template, user.email);
    return;
  }

  const { root } = core.getConfig();

  await mails.send({
    template,
    to: {
      address: user.email
    },
    lang: user.culture,
    data: {
      link: `${root}/signin`,
      logo: {
        src: `${root}/images/openagenda.png`,
        width: '300px'
      }
    },
  });
}

async function removeActiveUsersFromStore(services, stateStore, uids, time) {
  const {
    users: usersSvc
  } = services;

  const since = new Date((new Date()).getTime() - time);

  const activeUsers = await usersSvc.find({
    query: {
      last_signin: {
        $gte: since
      },
      uid: {
        $in: uids
      },
      $limit: limit
    }
  }).then(r => r?.data);

  log('there are %s users from store that are now active and must not longer be processed by task', activeUsers.length);

  for (const user of activeUsers) {
    await stateStore.del(user);
  }
}

async function loadInactiveUsers(services, time, uids = null) {
  const {
    users: usersSvc,
    core
  } = services;

  const {
    domain
  } = core.getConfig();

  const since = new Date((new Date()).getTime() - time);

  log('getting users that did not sign in since %s', since);

  const query = {
    last_signin: {
      $lte: since
    },
    email: {
      $notlike: `%@${domain}`
    },
    $limit: limit
  };

  if (uids) {
    query.uid = {
      $in: uids
    };
  }

  const users = [];
  let offset = 0;

  while (offset + limit <= maxHandledUsers) {
    for (const user of await usersSvc.find({
      query: { ...query, $skip: offset }
    }).then(r => r?.data)) {
      users.push(user);
    }
    offset += limit;
  }

  return users;
}

function InactiveUserStateStore(services, prefix, options = {}) {
  const {
    redis
  } = services;

  const {
    onStateUpdate = () => {}
  } = options;

  const pRedis = promisifyRedis(redis);

  return {
    set: (user, state) => {
      onStateUpdate({ user, state });
      return pRedis.set(`${prefix}${user.uid}`, JSON.stringify(state), 'EX', storeExpire);
    },
    get: async user => {
      log(`${prefix}${user.uid}`);
      return JSON.parse((await pRedis.get(`${prefix}${user.uid}`)) || '{"sent": []}');
    },
    del: async user => pRedis.del(`${prefix}${user.uid}`),
    list: () => pRedis.keys(`${prefix}*`)
      .then(keys => keys.map(k => parseInt(k.substr(prefix.length), 10)))
  };
}

function getLastSendFromNow(state) {
  return Math.ceil(((new Date()).getTime() - (new Date(state.sent[state.sent.length - 1].date)).getTime()) / (1000 * 60 * 60 * 24));
}

async function refreshAndLoadUsers(services, stateStore) {
  const storedUserUids = await stateStore.list();

  if (storedUserUids.length) {
    await removeActiveUsersFromStore(services, stateStore, storedUserUids, inactiveTime);

    const users = await loadInactiveUsers(services, inactiveTime, storedUserUids);

    log('loaded %s accounts from users service from %s that are still in process store', users.length, storedUserUids.length);

    if (users.length) {
      return users;
    }
  }

  const users = await loadInactiveUsers(services, inactiveTime);

  log('loaded %s accounts from users service', users.length);

  return users;
}

module.exports = services => async function notifyAndRemove(options = {}) {
  const {
    users: usersSvc
  } = services;

  const stateStore = InactiveUserStateStore(services, storePrefix, options);

  const users = await refreshAndLoadUsers(services, stateStore);

  const counts = {
    processed: 0,
    first: 0,
    second: 0,
    last: 0,
    removals: 0
  };

  for (const user of users) {
    log('processing user %s', user.uid);
    const state = await stateStore.get(user);
    counts.processed += 1;

    if (!state.sent.length) {
      log('sending first warning email to %s', user.uid);

      await sendEmail(services, user, 'inactiveUserFirstNotification', options);
      state.sent.push({ name: 'first', date: new Date() });
      counts.first += 1;
      await stateStore.set(user, state);
      continue;
    }

    const lastSendInDays = getLastSendFromNow(state);

    if (state.sent.length === 1) {
      if (lastSendInDays < 20) {
        log('first warning email sent %s days ago to %s. No action taken.', lastSendInDays, user.uid);
        continue;
      }

      log('sending second warning email to %s', user.uid);

      await sendEmail(services, user, 'inactiveUserSecondNotification', options);
      state.sent.push({ name: 'second', date: new Date() });
      await stateStore.set(user, state);
      counts.second += 1;
      continue;
    }

    if (state.sent.length === 2) {
      if (lastSendInDays < 7) {
        log('second warning email sent %s days ago to %s. No action taken.', lastSendInDays, user.uid);
        continue;
      }

      log('sending last warning email to %s', user.uid);

      await sendEmail(services, user, 'inactiveUserLastNotification', options);
      state.sent.push({ name: 'last', date: new Date() });
      await stateStore.set(user, state);
      counts.last += 1;
      continue;
    }

    if (state.sent.length === 3) {
      if (lastSendInDays < 2) {
        log('last warning email sent %s days ago to %s. No action taken.', lastSendInDays, user.uid);
        continue;
      }

      log('info', 'removing account of %s', user.uid);
      await usersSvc.remove(user.uid);
      await sendEmail(services, user, 'inactiveUserAccountRemoved', options);
      await stateStore.del(user, state);
      counts.removals += 1;
    }
  }

  log('info', 'notified and remove run done', counts);

  return counts;
};
