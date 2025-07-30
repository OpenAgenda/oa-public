import logs from '@openagenda/logs';

const log = logs('services/users/tasks/anonymizeUser');

async function resyncMemberEvents({ core, agendaUid, userUid }) {
  log(
    'resyncing events of agenda %s after user %s removal',
    agendaUid,
    userUid,
  );
  const stream = await core.agendas(agendaUid).events.search(
    {
      memberUid: userUid,
      state: null,
    },
    null,
    {
      stream: true,
      access: 'internal',
    },
  );

  for await (const event of stream) {
    await core.agendas(agendaUid).events.search.resyncEvent(event.uid);
    log(
      'event %s was resynced following removal of user %s',
      event.uid,
      userUid,
    );
  }
}

export default async function anonymizeDeletedUser(services, { user }) {
  const {
    core,
    activities: activitiesSvc,
    members: membersSvc,
    tracker,
  } = services;

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
            email: null,
          },
        },
        { requireCustom: false },
      );
    } catch (err) {
      log('error', 'could not mark member as removed', err);
    }

    const { agendaUid } = member;

    await resyncMemberEvents({ core, agendaUid, userUid: user.uid });
  }

  if (activitiesSvc) {
    log('removing user feed for user %s', user.uid);
    await activitiesSvc
      .feed({
        entityType: 'user',
        entityUid: user.uid,
      })
      .remove();

    log('anonymizing activities for user %s', user.uid);
    await activitiesSvc.activities.anonymize(`user:${user.uid}`);
    if (user.email) {
      await activitiesSvc.activities.anonymize(`email:${user.email}`);
    }
  }

  tracker('users.anonymizeDeletedUser.done');
}
