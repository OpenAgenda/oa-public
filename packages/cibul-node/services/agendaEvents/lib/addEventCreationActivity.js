import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import getMemberName from './utils/getMemberName.js';

const log = logs('agendaEvents/addEventCreationActivity');

export default async function addEventCreationActivity(
  services,
  eventFeed,
  { _ae, agenda, event, user },
  context,
) {
  log('processing');
  const {
    activities: activitiesSvc,
    members: membersSvc,
    agendas: agendasSvc,
    events: eventsSvc,
  } = services;

  if (!user) {
    return log(
      'error',
      new VError('user of uid %s not found', context.userUid),
    );
  }

  const { duplicateOrigin } = context;

  // Duplication
  if (duplicateOrigin) {
    const duplicateOriginAgenda = await agendasSvc.get(
      { uid: duplicateOrigin.agendaUid },
      {
        internal: true,
        private: null,
      },
    );

    const originEvent = await eventsSvc.get(duplicateOrigin.eventUid, {
      includeFields: ['ownerUid'],
      access: 'internal',
      private: null,
    });

    await activitiesSvc.addActivity(eventFeed, {
      actor: `user:${user.uid}`,
      verb: 'event.duplicate',
      object: `event:${event.uid}`,
      target: `agenda:${agenda.uid}`,
      store: {
        labels: {
          actor: getMemberName(context.member, user),
          object: event.title,
          target: agenda.title,
          duplicateOriginAgenda: duplicateOriginAgenda.title,
        },
        duplicateOriginAgendaUid: duplicateOriginAgenda.uid,
        ownerUid: originEvent.ownerUid,
      },
    });
  } else {
    await activitiesSvc.addActivity(eventFeed, {
      actor: `user:${user.uid}`,
      verb: 'event.create',
      object: `event:${event.uid}`,
      target: `agenda:${agenda.uid}`,
      store: {
        labels: {
          actor: getMemberName(context.member, user),
          object: event.title,
          target: agenda.title,
        },
      },
    });
  }

  await membersSvc.patch.actions.increment({
    agendaUid: agenda.uid,
    userUid: user.uid,
  });
}
