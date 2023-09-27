'use strict';

const VError = require('@openagenda/verror');
const log = require('@openagenda/logs')('services/agendaLocations/beforeRemove');
const createLocationFeeds = require('../lib/createLocationFeeds');

module.exports = services => async (location, options = {}) => {
  const {
    events: eventSvc,
    core,
    activities,
    members,
  } = services;
  const {
    removeEvents,
  } = options;

  if (removeEvents) {
    log('info', 'deleting events associated with location of uid %s', location.uid);

    let hasMore = true;
    let offsetErrored = 0;

    do {
      const event = await eventSvc.list({
        locationUid: location.uid,
      }, { offset: offsetErrored, limit: 1 }, { private: null, draft: null, includeFields: ['uid', 'agendaUid'] })
        .then(events => events.pop());

      if (!event) {
        hasMore = false;
        continue;
      }

      try {
        log('deleting event %s', event.uid);

        await core.agendas(event.agendaUid).events.remove(event.uid);
      } catch (e) {
        offsetErrored += 1;
        log('error', 'failed to remove event %s with location uid %s', event.uid, location.uid, e);
      }
    } while (hasMore);
  }

  // Activity
  if (!options.mergedIn) {
    const { agendaUid, userUid } = options.context;
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
        locationUid: location.uid,
      });
    } catch (e) {
      return log.error(new VError({
        cause: e,
        info: {
          agendaUid,
          setUid: agenda.setUid,
          locationUid: location.uid,
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
      await activities.addActivity({ entityType: 'location', entityUid: location.uid }, {
        actor: `user:${userUid}`,
        verb: 'location.remove',
        object: `location:${location.uid}`,
        target: `agenda:${agenda.uid}`,
        store: {
          labels: {
            actor: member.name ?? member.custom?.contactName ?? member.user.fullName,
            object: location.name,
            target: agenda.title,
          },
        },
      });
    } catch (e) {
      log('error', 'failed to create location remove activity', e);
    }
  }

  try {
    await activities.feed({ entityType: 'location', entityUid: location.uid }).remove();
  } catch (e) {
    log.error(`failed to remove feed location ${location.uid}`, e);
  }
};
