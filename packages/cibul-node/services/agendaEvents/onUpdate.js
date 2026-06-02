import _ from 'lodash';
import VError from '@openagenda/verror';
import logs from '@openagenda/logs';
import refreshAgenda from '../../core/agendas/utils/refreshAgenda.js';
import eventLastTimingEnd from '../../core/agendas/utils/eventLastTimingEnd.js';
import fallbackContextGet from './lib/fallbackContextGet.js';
import sendEventChangeState from './lib/sendEventChangeState.js';
import addEventUpdateActivity from './lib/addEventUpdateActivity.js';
import addEventAggregationActivity from './lib/addEventAggregationActivity.js';

const log = logs('agendaEvents/onUpdate');

export default async ({ config, services }, before, after, context) => {
  log(
    'updated agenda-event from %j to %j, %j',
    before,
    after,
    _.pick(context, ['aggregated', 'batched', 'stateChangeType']),
  );

  const { agenda, event, user } = await fallbackContextGet(
    { services },
    'onUpdate',
    after,
    context,
  );

  // source added
  if ((after.sourcePaths?.length || 0) > (before.sourcePaths?.length || 0)) {
    try {
      await addEventAggregationActivity(
        services,
        { entityType: 'event', entityUid: event.uid },
        { agenda, event, ae: after },
        context,
      );
    } catch (e) {
      log('error', e);
    }
  }

  const stateChanged = before.state !== after.state;

  // Send emails
  if (stateChanged) {
    // eventChangeState
    // myEventChangeState
    try {
      await sendEventChangeState(
        { config, services },
        {
          agendaEvent: after,
          before,
          context,
          agenda,
          event,
        },
      );
    } catch (error) {
      log.error(new VError(error, 'Cannot send event change state emails'));
    }
  }

  if (stateChanged && user) {
    try {
      await addEventUpdateActivity(
        services,
        { agenda, event, user },
        before,
        after,
        context.stateChangeType,
      );
    } catch (e) {
      log.error(new VError(e, 'Cannot create state change activities'));
    }
  }

  // Publish / unpublish on a per-agenda event basis previously left both
  // the agenda's updatedAt and the agenda-search ES doc untouched, so
  // the public search page's event counts could stay stale until the
  // next monthly rebuild. Bump updatedAt (for the resyncUpdated safety
  // net) and mark the agenda-search doc for refresh — conditional on
  // whether the event's lastTiming is inside the current window.
  if (stateChanged && agenda?.uid) {
    await refreshAgenda(services, agenda.uid).catch((e) =>
      log.error(new VError(e, 'failed to refresh agenda after state change')));
    await services.agendaSearch
      ?.markRefreshNow({
        uid: agenda.uid,
        eventLastTiming: eventLastTimingEnd(event),
      })
      .catch((e) =>
        log.error(new VError(e, 'failed to mark agenda-search refresh')));
  }
};
