import _ from 'lodash';
import deepDiff from 'deep-diff';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import createLocationFeeds from '../lib/createLocationFeeds.js';
import registerUpdateActivity from '../lib/registerUpdateActivity.js';

const { diff } = deepDiff;

const log = logs('services/agendaLocations/onUpdate');

export default function onUpdate(queue, services) {
  return async (before, after, context) => {
    log('location %s', before.uid);
    try {
      if (diff(_.omit(before, ['updatedAt']), _.omit(after, ['updatedAt']))) {
        queue('syncImpactedEventsAndAgendas', before, after);
      }
    } catch (e) {
      log('error', 'failed to evaluate distance', e);
    }

    // Activity
    const { core } = services;
    const { agendaUid, userUid } = context || {};
    let agenda;

    if (!agendaUid) {
      log.warn('no agendaUid in context, not registering activity');
      return;
    }
    try {
      agenda = await core.agendas(agendaUid).get({
        detailed: true,
        access: 'internal',
        includeEvent: true,
        private: null,
      });
    } catch (e) {
      return log.error(
        new VError(
          {
            cause: e,
            info: {
              agendaUid,
            },
          },
          'Cannot get agenda',
        ),
      );
    }

    try {
      await createLocationFeeds(services, {
        agendaUid,
        setUid: agenda.setUid,
        locationUid: after.uid,
      });
    } catch (e) {
      return log.error(
        new VError(
          {
            cause: e,
            info: {
              agendaUid,
              setUid: agenda.setUid,
              locationUid: after.uid,
            },
          },
          'Cannot create location feeds',
        ),
      );
    }
    if (!userUid) {
      log.warn('no userUid in context, not registering activity');
      return;
    }

    try {
      await registerUpdateActivity({
        services,
        agendaUid,
        userUid,
        agenda,
        before,
        after,
      });
    } catch (e) {
      log('Failed to register update activity');
      log.error(
        new VError(
          {
            cause: e,
            info: {
              agendaUid,
              locationUid: before.uid,
            },
          },
          'Failed to register update activity',
        ),
      );
    }
  };
}
