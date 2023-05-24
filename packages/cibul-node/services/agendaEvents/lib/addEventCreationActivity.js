'use strict';

const VError = require('@openagenda/verror');
const log = require('@openagenda/logs')('agendaEvents/addEventCreationActivity');

const getMemberName = require('./utils/getMemberName');

module.exports = async function addEventCreationActivity(services, eventFeed, {
  ae,
  agenda,
  event,
  user,
}, context) {
  log('processing');
  const {
    activities: activitiesSvc,
    members: membersSvc,
    agendas: agendasSvc,
    events: eventsSvc,
  } = services;

  if (!user) {
    return log('error', new VError('user of uid %s not found', context.userUid));
  }

  const { duplicateOrigin } = context;

  // Duplication
  if (duplicateOrigin) {
    const duplicateOriginAgenda = await agendasSvc.get({ uid: duplicateOrigin.agendaUid }, {
      internal: true,
      private: null,
    });

    const originEvent = await eventsSvc.get(duplicateOrigin.eventUid, {
      includeFields: ['ownerUid'],
      access: 'internal',
      private: null,
    });

    await activitiesSvc.feed(eventFeed).activities.add({
      actor: `user:${user.uid}`,
      verb: 'event.duplicate',
      object: `event:${event.uid}`,
      target: `agenda:${agenda.uid}`,
      store: {
        labels: {
          actor: getMemberName(ae.member, user),
          object: event.title,
          target: agenda.title,
          duplicateOriginAgenda: duplicateOriginAgenda.title,
        },
        duplicateOriginAgendaUid: duplicateOriginAgenda.uid,
        ownerUid: originEvent.ownerUid,
      },
    });
  } else {
    await activitiesSvc.feed(eventFeed).activities.add({
      actor: `user:${user.uid}`,
      verb: 'event.create',
      object: `event:${event.uid}`,
      target: `agenda:${agenda.uid}`,
      store: {
        labels: {
          actor: getMemberName(ae.member, user),
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
};
