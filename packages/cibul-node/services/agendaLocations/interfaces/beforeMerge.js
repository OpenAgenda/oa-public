'use strict';

const VError = require('@openagenda/verror');
const log = require('@openagenda/logs')('services/agendaLocations/beforeMerge');
const createLocationFeeds = require('../lib/createLocationFeeds');

module.exports = services => async (mergeInLocation, locations, context) => {
  const {
    core,
    events: eventSvc,
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

  for (const locationUid of locations.map(l => l.uid)) {
    let hasMore = true;
    let offsetErrored = 0;

    do {
      const event = await eventSvc.list({
        locationUid,
      }, { offset: offsetErrored, limit: 1 }, { private: null, draft: null }).then(events => events.pop());

      if (!event) {
        hasMore = false;
        continue;
      }

      try {
        log('setting location %s on event %s', mergeInLocation.uid, event.uid);
        await core.agendas(event.agendaUid).events.patch(event.uid, {
          location: {
            uid: mergeInLocation.uid,
          },
        }, {
          access: 'internal',
        });
      } catch (e) {
        offsetErrored += 1;
        log('error', 'failed to update event %s with location uid %s', event.uid, locationUid, e);
      }
    } while (hasMore);
  }

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
    await activities.feed({ entityType: 'location', entityUid: mergeInLocation.uid }).activities.add({
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
