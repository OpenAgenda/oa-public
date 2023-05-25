'use strict';

const _ = require('lodash');
const { diff } = require('deep-diff');
const VError = require('@openagenda/verror');
const log = require('@openagenda/logs')('services/agendaLocations/onUpdate');
const createLocationFeeds = require('../lib/createLocationFeeds');
const registerUpdateActivity = require('../lib/registerUpdateActivity');

module.exports = function onUpdate(queue, services) {
  return async (before, after, context) => {
    log('location %s', before.uid);
    try {
      if (diff(
        _.omit(before, ['updatedAt']),
        _.omit(after, ['updatedAt']),
      )) {
        queue('syncImpactedEventsAndAgendas', before, after);
      }
    } catch (e) {
      log('error', 'failed to evaluate distance', e);
    }

    // Activity
    const { core } = services;
    const { agendaUid, userUid } = context;
    let agenda;

    try {
      agenda = await core.agendas(agendaUid).get({
        detailed: true,
        access: 'internal',
        includeEvent: true,
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
        locationUid: after.uid,
      });
    } catch (e) {
      return log.error(new VError({
        cause: e,
        info: {
          agendaUid,
          setUid: agenda.setUid,
          locationUid: after.uid,
        },
      }, 'Cannot create location feeds'));
    }

    if (userUid) {
      await registerUpdateActivity({
        services,
        agendaUid,
        userUid,
        agenda,
        before,
        after,
      });
    } else {
      log.debug('no userUid in context, not registering activity');
    }
  };
};
