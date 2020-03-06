'use strict';

module.exports = function onActivation() {
  return async context => {
    const {
      invitations,
      activities,
      users
    } = context.services;
    const user = context.result;

    if (!user) {
      return context;
    }

    await users.generateApiKey(user.uid, {
      publicKey: true
    });

    const { invitation } = context.params.optionals || {};

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

    if (invitation) {
      await invitations.execute({ token: invitation }, { user });
    }

    await invitations.execute({ email: user.email }, { user });
  };
};
