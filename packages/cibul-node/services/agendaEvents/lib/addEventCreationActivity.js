'use strict';

const VError = require('verror');
const log = require('@openagenda/logs')('agendaEvents/addEventCreationActivity');

module.exports = async (services, eventFeed, { agenda, event, user }, context) => {
  log('processing');
  const {
    activities: activitiesSvc,
    members: membersSvc
  } = services;

  if (!user) {
    return log('error', new VError('user of uid %s not found', context.userUid));
  }

  await activitiesSvc.feed(eventFeed).activities.add({
    actor: `user:${user.uid}`,
    verb: 'event.create',
    object: `event:${event.uid}`,
    target: `agenda:${agenda.uid}`,
    store: {
      labels: {
        actor: user.fullName,
        object: event.title,
        target: agenda.title
      }
    }
  });

  await membersSvc.patch.actions.increment({
    agendaUid: agenda.uid,
    userUid: user.uid
  });
};
