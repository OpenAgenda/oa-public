import logs from '@openagenda/logs';

const log = logs('core/agendas/events/lib/createTransferOwnershipActivity');

async function getUserDisplayName(services, userUid) {
  if (!userUid) return null;
  try {
    const user = await services.users.findOne({ query: { uid: userUid } });
    return user?.fullName || null;
  } catch (e) {
    log('error', 'failed to fetch user display name', { userUid, error: e });
    return null;
  }
}

export default async function createTransferOwnershipActivity(
  services,
  { agenda, event, previousOwnerUid, newOwnerUid, actingUser, actingMember },
) {
  const { activities } = services;

  if (!activities) {
    log.warn('activities service not initialized');
    return;
  }

  const newOwnerName = await getUserDisplayName(services, newOwnerUid);

  const feedIdentifiers = { entityType: 'event', entityUid: event.uid };

  let eventFeed = feedIdentifiers;
  try {
    eventFeed = await activities.feed(feedIdentifiers).create();
  } catch (err) {
    if (err.message !== 'Feed already exists') {
      throw err;
    }
  }

  await activities.feed(eventFeed).activities.add({
    actor: actingUser ? `user:${actingUser.uid}` : `agenda:${agenda.uid}`,
    verb: 'event.transferOwnership',
    object: `event:${event.uid}`,
    target: `user:${newOwnerUid}`,
    store: {
      previousOwnerUid,
      newOwnerUid,
      agendaUid: agenda.uid,
      labels: {
        actor: actingMember?.custom?.contactName || actingUser?.name,
        object: event.title,
        target: newOwnerName,
        agenda: agenda.title,
      },
    },
  });

  log('added transferOwnership activity for event %s', event.uid);
}
