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
      log('removing user feed for user %s', user.uid);
      await promisify(
        activitiesSvc.feed({
          entityType: 'user',
          entityUid: user.uid
        }).remove
      )();

      log('anonymizing activities for user %s', user.uid);
      await activitiesSvc.activities.anonymize(`user:${user.uid}`);
      if (user.email) {
        await activitiesSvc.activities.anonymize(`email:${user.email}`);
      }
    }

    const members = await membersSvc.list({ userUid: user.uid }, { limit: 1000 });

    log('anonymize %s member refs', members.length);

    for (const member of members) {
      try {
        await membersSvc.patch(
          member.id,
          {
            deletedUser: true,
            custom: {
              ...member.custom,
              contactNumber: null,
              contactName: null,
              email: null
            },
          },
          { requireCustom: false }
        );
      } catch (err) {
        log('error', 'could not remove member ', err);
      }
    }
  };
};
