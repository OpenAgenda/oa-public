'use strict';

const VError = require('@openagenda/verror');
const log = require('@openagenda/logs')('services/agendaLocations/beforeMerge');
const createLocationFeeds = require('../lib/createLocationFeeds');

module.exports = (queue, services) => async (mergeInLocation, locations, context) => {
  const {
    core,
    activities,
    members,
  } = services;

  const { agendaUid, userUid } = context;

  log(
    'info',
    'processing event updates for merging of locations %j into %s',
    locations.map(l => l.uid),
    mergeInLocation.uid,
  );

  queue('beforeMergeEventUpdate', locations.map(l => l.uid), mergeInLocation.uid);

  // Activity
  let agenda;

  try {
    agenda = await core.agendas(agendaUid).get({
      detailed: true,
      access: 'internal',
      private: null,
    });
  } catch (e) {
    return log.error(new VError({
      cause: e,
      info: {
        agendaUid,
      },
    }, 'Cannot get agenda'));
  }

  try {
    await createLocationFeeds(services, {
      agendaUid,
      setUid: agenda.setUid,
      locationUid: mergeInLocation.uid,
    });
  } catch (e) {
    return log.error(new VError({
      cause: e,
      info: {
        agendaUid,
        setUid: agenda.setUid,
        locationUid: mergeInLocation.uid,
      },
    }, 'Cannot create location feeds'));
  }

  let member;

  try {
    member = await members.get({ agendaUid, userUid }, { detailed: true });
  } catch (e) {
    return log('error', new VError(e, 'Error to get member', { agendaUid, userUid }));
  }

  try {
    await activities.addActivity({ entityType: 'location', entityUid: mergeInLocation.uid }, {
      actor: `user:${userUid}`,
      verb: 'location.merge',
      object: `location:${mergeInLocation.uid}`,
      target: `agenda:${agenda.uid}`,
      store: {
        labels: {
          actor: member.name ?? member.custom?.contactName ?? member.user.fullName,
          object: mergeInLocation.name,
          target: agenda.title,
        },
        mergedCount: locations.length,
      },
    });
  } catch (e) {
    log('error', 'failed to create location merge activity', e);
  }
};
