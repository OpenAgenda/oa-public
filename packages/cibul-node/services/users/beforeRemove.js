'use strict';

const { promisify } = require('util');
const log = require('@openagenda/logs')('services/users/beforeRemove');

/**
 * this interface will prevent user removal if not correctly executed
 */
module.exports = function beforeRemove() {
  return async ctx => {
    const {
      activities: activitiesSvc,
      members: membersSvc
    } = ctx.self.config.services;
    const user = ctx.params.before;

    if (!user) {
      return ctx;
    }

    if (activitiesSvc) {
      await promisify(activitiesSvc.feed({ entityType: 'user', entityUid: user.uid }).remove)();
    }

    const members = await membersSvc.list({ userUid: user.uid }, { limit: 1000 });

    for (const member of members) {
      try {
        await membersSvc.patch(
          member.id,
          { deletedUser: true }
        );
      } catch (err) {
        log('error', 'could not remove member ', err);
      }
    }
  };
};
