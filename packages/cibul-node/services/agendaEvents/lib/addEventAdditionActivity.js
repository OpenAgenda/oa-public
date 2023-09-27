'use strict';

const getMemberName = require('./utils/getMemberName');

module.exports = async (
  services,
  eventFeed,
  {
    agenda,
    user,
    event,
    ae,
  },
  context,
) => {
  const {
    activities: activitiesSvc,
  } = services;

  const { sourceAgenda } = context;

  await activitiesSvc.addActivity(eventFeed, {
    actor: `user:${user.uid}`,
    verb: 'agenda.addEvent',
    object: `event:${event.uid}`,
    target: `agenda:${agenda.uid}`, // aggregator
    store: {
      state: ae.state,
      ownerUid: event.ownerUid,
      originAgendaUid: event.agendaUid,
      sourceAgendaUid: sourceAgenda.uid,
      labels: {
        actor: getMemberName(ae.member, user),
        object: event.title,
        target: agenda.title,
        sourceAgenda: sourceAgenda.title,
      },
    },
  });
};
