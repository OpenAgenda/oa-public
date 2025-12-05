import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/users/onActivation');

export default function onActivation() {
  return async (context) => {
    const {
      invitations,
      activities,
      users,
      inboxes: { Inbox },
      behavioralEmails,
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
      await activities
        .feed({
          entityType: 'user',
          entityUid: user.uid,
        })
        .create();
    } catch (err) {
      if (err.message !== 'Feed already exists') {
        log('error', err);
      }
    }

    behavioralEmails.addJob(
      'inactiveUser',
      { userUid: user.uid },
      { delay: 7 * 24 * 60 * 60 * 1000 },
    );

    const { invitation } = context.params.optionals || {};

    if (invitation) {
      await invitations.execute({ token: invitation }, { user });
    }

    await invitations.execute({ email: user.email }, { user });
  };
}
