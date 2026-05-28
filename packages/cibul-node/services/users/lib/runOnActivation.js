import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/users/runOnActivation');

export default async function runOnActivation(services, user, optionals = {}) {
  if (!user) return;

  const {
    invitations,
    activities,
    inboxes: { Inbox },
    behavioralEmails,
  } = services;

  // Idempotency: the user's Inbox is the first persistent side-effect of this
  // chain, so its existence means we've already run. The re-entry path opens
  // up when better-auth's afterEmailVerification fires for a user that was
  // already activated via legacy — without this guard we'd re-enqueue the
  // inactiveUser delayed job. `_get` is the read-only variant of `get` (no
  // create-on-null), which is what we want here.
  const inbox = await new Inbox({ type: 'user', identifier: user.uid })._get();
  if (inbox.data) return;

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

  const { invitation } = optionals;

  if (invitation) {
    await invitations.execute({ token: invitation }, { user });
  }

  await invitations.execute({ email: user.email }, { user });
}
