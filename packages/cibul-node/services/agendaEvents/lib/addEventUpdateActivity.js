'use strict';

const log = require('@openagenda/logs')('agendaEvents/addEventUpdateActivity');

const getMemberName = require('./utils/getMemberName');

module.exports = async (services, { agenda, event, user }, before, after, changeStateType) => {
  log('processing');

  const {
    activities: activitiesSvc,
    members: membersSvc,
    core,
  } = services;

  if (!activitiesSvc) {
    log('activities services is not initialized');
    return;
  }

  const contributor = await membersSvc.get({
    agendaUid: agenda.uid,
    userUid: user.uid,
  });

  const isUnpublished = before.state === 2 && after.state !== 2;
  const isPublished = before.state !== 2 && after.state === 2;
  const isRefused = before.state !== -1 && after.state === -1;

  const activityInfo = {
    actor: `user:${user.uid}`,
    object: `event:${event.uid}`,
    target: `agenda:${agenda.uid}`,
  };
  const activityLabels = {
    actor: getMemberName(contributor, user),
    object: event.title,
    target: agenda.title,
  };

  if (isPublished) {
    log('publishing');
    return activitiesSvc.feed({
      entityType: 'event',
      entityUid: event.uid,
    }).activities.add({
      ...activityInfo,
      verb: 'agenda.publishEvent',
      store: {
        labels: activityLabels,
        contributorUid: after.userUid,
        ownerUid: after.ownerUid,
        sourceAgendaUids: after.sourceAgendas.map(v => v.uid),
        // origin is not always set. When the event was created by script for example.
        originAgendaUid: event.origin ? event.origin.uid : null,
      },
    });
  }

  if (isRefused) {
    log('refusing');
    return activitiesSvc.feed({
      entityType: 'event',
      entityUid: event.uid,
    }).activities.add({
      ...activityInfo,
      verb: 'agenda.refuseEvent',
      store: {
        labels: activityLabels,
        contributorUid: after.userUid,
        ownerUid: after.ownerUid,
        sourceAgendaUids: after.sourceAgendas.map(v => v.uid),
        // origin is not always set. When the event was created by script for example.
        originAgendaUid: event.origin ? event.origin.uid : null,
      },
    });
  }

  if (isUnpublished) {
    log('unpublishing');
    return activitiesSvc.feed({
      entityType: 'event',
      entityUid: event.uid,
    }).activities.add({
      ...activityInfo,
      verb: 'agenda.unpublishEvent',
      store: {
        labels: activityLabels,
        contributorUid: after.userUid,
        ownerUid: after.ownerUid,
        sourceAgendaUids: after.sourceAgendas.map(v => v.uid),
        // origin is not always set. When the event was created by script for example.
        originAgendaUid: event.origin ? event.origin.uid : null,
      },
    });
  }

  if (before.state !== after.state && changeStateType === core.constants.stateChangeTypes.system) {
    log('system change state');
    return activitiesSvc.feed({
      entityType: 'agenda',
      entityUid: agenda.uid,
    }).activities.add({
      ...activityInfo,
      verb: 'agenda.systemChangeEventState',
      store: {
        labels: activityLabels,
        oldState: before.state,
        newState: after.state,
      },
    });
  }

  if (before.state !== after.state) {
    log('change state');
    return activitiesSvc.feed({
      entityType: 'agenda',
      entityUid: agenda.uid,
    }).activities.add({
      ...activityInfo,
      verb: 'agenda.changeEventState',
      store: {
        labels: activityLabels,
        oldState: before.state,
        newState: after.state,
      },
    });
  }
};
