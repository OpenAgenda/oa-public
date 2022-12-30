'use strict';

const _ = require('lodash');

module.exports = function onActivation() {
  return async context => {
    const {
      invitations,
      activities,
      users,
      inboxes: { Inbox },
    } = context.services;
    const user = context.result;

    if (!user) {
      return context;
    }

    await users.generateApiKey(user.uid, {
      publicKey: true,
    });

    new Inbox().create({ type: 'user', identifier: user.uid }).then(_.noop);

    try {
      await activities.feed({
        entityType: 'user',
        entityUid: user.uid,
      }).create();
    } catch (err) {
      if (err.message !== 'Feed already exists') {
        throw err;
      }
    }

    const { invitation } = context.params.optionals || {};

    if (invitation) {
      await invitations.execute({ token: invitation }, { user });
    }

    await invitations.execute({ email: user.email }, { user });
  };
};
