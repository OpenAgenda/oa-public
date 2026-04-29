import * as invitationsSvc from '@openagenda/invitations';
import logs from '@openagenda/logs';

const log = logs('services/users/onCreate');

export default function onCreate(config, services) {
  const { discord } = services;
  return async (context) => {
    const user = context.result;
    const { optionals } = context.params;

    if (!user) {
      return context;
    }

    if (optionals?.invitation) {
      const { invitation } = await invitationsSvc.get({
        token: optionals.invitation,
      });

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
}
