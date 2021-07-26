'use strict';

module.exports = async (services, eventFeed, { agenda, user, event }, context) => {
  const {
    activities: activitiesSvc
  } = services;

  const { sourceAgenda } = context;

  await activitiesSvc.feed(eventFeed).activities.add({
    actor: `user:${user.uid}`,
    verb: 'agenda.addEvent',
    object: `event:${event.uid}`,
    target: `agenda:${agenda.uid}`, // aggregator
    store: {
      labels: {
        actor: user.fullName,
        object: event.title,
        target: agenda.title,
        sourceAgenda: sourceAgenda.title
      },
      sourceAgenda: sourceAgenda.uid
    }
  });
};
