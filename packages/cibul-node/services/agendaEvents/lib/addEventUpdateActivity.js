'use strict';

const log = require('@openagenda/logs')('agendaEvents/addEventUpdateActivity');

module.exports = async (services, { agenda, event, user }, before, after, changeStateType) => {
  log('processing');

  const {
    activities: activitiesSvc,
    core
  } = services;

  if (!activitiesSvc) {
    log('activities services is not initialized');
    return;
  }

  const hasUnpublished = before.state === 2 && after.state !== 2;
  const hasPublished = after.state === 2 && before.state !== 2;

  const activityInfo = {
    actor: `user:${user.uid}`,
    object: `event:${event.uid}`,
    target: `agenda:${agenda.uid}`,
  };
  const activityLabels = {
    actor: user.fullName,
    object: event.title,
    target: agenda.title
  };

  if (hasUnpublished && (core.constants.stateChangeTypes.system === changeStateType)) {
    log('system unpublish');
    return activitiesSvc.feed({
      entityType: 'event',
      entityUid: event.uid
    }).activities.add({
      ...activityInfo,
      verb: 'agenda.systemUnpublishEvent',
      store: {
        labels: activityLabels
      }
    });
  }

  if (hasUnpublished || hasPublished) {
    log(before.state === 2 ? 'unpublishing' : 'publishing');
    return activitiesSvc.feed({
      entityType: 'event',
      entityUid: event.uid
    }).activities.add({
      ...activityInfo,
      verb: `agenda.${after.state === 2 ? 'publish' : 'unpublish'}Event`,
      store: {
        labels: activityLabels,
        // origin is not always set. When the event was created by script for example.
        originAgendaUid: event.origin ? event.origin.uid : null
      }
    });
  }

  if (before.state !== after.state) {
    log('change state');
    return activitiesSvc.feed({
      entityType: 'agenda',
      entityUid: agenda.uid
    }).activities.add({
      ...activityInfo,
      verb: 'agenda.changeEventState',
      store: {
        labels: activityLabels,
        oldState: before.state,
        newState: after.state
      }
    });
  }
};
