import _ from 'lodash';
import logs from '@openagenda/logs';

const log = logs('services/users/runOnActivation');

export default async function runOnActivation(services, user, optionals = {}) {
  if (!user) return;

  const {
    keys,
    invitations,
    activities,
    users,
    inboxes: { Inbox },
    behavioralEmails,
  } = services;

  // Idempotency: a userPublic api key signals this chain has already run.
  // Without this guard, re-running rotates the key (breaks any client using
  // the previous one) and re-enqueues the inactiveUser delayed job. The
  // re-entry path opens up in phase 3b/4 when better-auth's
  // afterEmailVerification fires for users activated via legacy first.
  // services.keys is a factory: it takes identifiers then returns the
  // bound endpoints. optionalKey: true lets us look up by (type, identifier)
  // without supplying the key value.
  const existing = await keys({ type: 'userPublic', identifier: user.uid }).get(
    { optionalKey: true },
  );
  if (existing) return;

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

  const { invitation } = optionals;

  if (invitation) {
    await invitations.execute({ token: invitation }, { user });
  }

  await invitations.execute({ email: user.email }, { user });
}
