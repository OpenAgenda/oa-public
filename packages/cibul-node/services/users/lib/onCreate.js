'use strict';

const invitationsSvc = require('@openagenda/invitations');
const log = require('@openagenda/logs')('services/users/onCreate');

module.exports = function onCreate(config, services) {
  const { discord } = services;
  return async context => {
    const user = context.result;
    const { optionals } = context.params;

    if (!user) {
      return context;
    }

    if (optionals.invitation) {
      const { invitation } = await invitationsSvc.get({ token: optionals.invitation });

      if (invitation.email !== user.email) {
        invitation.email = user.email;
        await invitation.save();
      }
    }

    try {
      await discord.notifyUserCreation(user);
    } catch (e) {
      log('error', 'failed to notify discord');
    }
  };
};
