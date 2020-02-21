'use strict';

module.exports = function onActivation(services) {
  const {
    invitations,
    activities,
    users
  } = services;

  return async context => {
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
