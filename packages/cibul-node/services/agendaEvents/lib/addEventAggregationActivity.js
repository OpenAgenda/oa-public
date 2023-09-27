'use strict';

module.exports = async (services, eventFeed, { agenda, event, ae }, context) => {
  const {
    activities: activitiesSvc,
  } = services;

  const { sourceAgenda } = context;

  await activitiesSvc.addActivity(eventFeed, {
    actor: `agenda:${sourceAgenda.uid}`,
    verb: 'agenda.aggregateEvent',
    object: `event:${event.uid}`,
    target: `agenda:${agenda.uid}`, // aggregator
    store: {
      state: ae.state,
      ownerUid: event.ownerUid,
      originAgendaUid: event.agendaUid,
      labels: {
        actor: sourceAgenda.title,
        object: event.title,
        target: agenda.title,
      },
    },
  });
};
