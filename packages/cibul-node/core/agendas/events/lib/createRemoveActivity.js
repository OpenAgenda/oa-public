import logs from '@openagenda/logs';

const log = logs('core/agendas/events/lib/createRemoveActivity');

function createDelete(activities, { agenda, event, actingUser, actingMember }) {
  return activities
    .addActivity(
      { entityType: 'event', entityUid: event.uid },
      {
        actor: `user:${actingUser.uid}`,
        verb: 'event.delete',
        object: `event:${event.uid}`,
        target: `agenda:${agenda.uid}`,
        store: {
          labels: {
            actor: actingMember?.custom?.contactName || actingUser?.name,
            object: event.title,
            target: agenda.title,
          },
        },
      },
    )
    .then((result) => {
      log('added delete activity');
      return result;
    });
}

function createRemove(
  activities,
  { agenda, event, actingUser, actingMember, agendaEvent },
) {
  return activities
    .addActivity(
      { entityType: 'event', entityUid: event.uid },
      {
        actor: `user:${actingUser.uid}`,
        verb: 'agenda.removeEvent',
        object: `event:${event.uid}`,
        target: `agenda:${agenda.uid}`,
        store: {
          state: agendaEvent.state,
          ownerUid: event.ownerUid,
          originAgendaUid: event.agendaUid,
          sourceAgendaUids: agendaEvent.sourcePaths.map((v) => v[v.length - 1]),
          labels: {
            actor: actingMember?.custom?.contactName || actingUser?.name,
            object: event.title,
            target: agenda.title,
          },
        },
      },
    )
    .then((result) => {
      log('created remove activity');
      return result;
    });
}

function createSystemRemove(activities, { agenda, event, agendaEvent }) {
  return activities
    .addActivity(
      { entityType: 'event', entityUid: event.uid },
      {
        actor: `agenda:${agenda.uid}`,
        verb: 'agenda.systemRemoveEvent',
        object: `event:${event.uid}`,
        target: `agenda:${agenda.uid}`,
        store: {
          contributorUid: agendaEvent.userUid,
          labels: {
            object: event.title,
            target: agenda.title,
          },
        },
      },
    )
    .then((result) => {
      log('created system remove');
      return result;
    });
}

export default async function createRemoveActivity(services, params) {
  const { activities } = services;

  if (!activities) {
    log.warn('activities services not initialized');
    return;
  }

  const { isDelete, actingUser, agenda, event } = params;

  if (isDelete) {
    await createDelete(activities, params);
  } else if (!actingUser) {
    await createSystemRemove(activities, params);
  } else {
    await createRemove(activities, params);
  }

  await activities
    .feed({ entityType: 'agenda', entityUid: agenda.uid })
    .unfollow({ entityType: 'event', entityUid: event.uid });
  log('removed link between agenda and event feeds');
}
