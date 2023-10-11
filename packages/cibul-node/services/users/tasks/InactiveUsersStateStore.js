'use strict';

const log = require('@openagenda/logs')('services/users/tasks/InactiveUsersStateStore');

const storeExpire = 60 * 60 * 24 * 30 * 2; // 2 months

module.exports = function InactiveUserStateStore(services, prefix, options = {}) {
  const {
    redis,
  } = services;

  const {
    onStateUpdate = () => {},
  } = options;

  const listUids = async () => {
    const uids = await redis.get(`${prefix}uids`);
    return uids ? JSON.parse(uids) : [];
  };

  const addToUids = async uid => {
    const uids = await listUids();
    if (!uids.includes(uid)) {
      uids.push(uid);
      await redis.set(`${prefix}uids`, JSON.stringify(uids), 'EX', storeExpire);
    }
  };

  const removeFromUids = async uid => {
    const uids = await listUids();
    if (uids.includes(uid)) {
      await redis.set(`${prefix}uids`, JSON.stringify(uids.filter(storedUid => storedUid !== uid)), 'EX', storeExpire);
    }
  };

  return {
    set: async (user, state) => {
      onStateUpdate({ user, state });
      await addToUids(user.uid);
      return redis.set(`${prefix}${user.uid}`, JSON.stringify(state), 'EX', storeExpire);
    },
    get: async user => {
      log(`${prefix}${user.uid}`);
      return JSON.parse(await redis.get(`${prefix}${user.uid}`) || '{"sent": []}');
    },
    del: async user => {
      await removeFromUids(user.uid);
      await redis.del(`${prefix}${user.uid}`);
    },
    list: listUids,
  };
};
