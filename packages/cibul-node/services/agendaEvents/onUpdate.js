'use strict';

const _ = require('lodash');
const VError = require('verror');

const log = require('@openagenda/logs')('agendaEvents/onUpdate');

const fallbackContextGet = require('./lib/fallbackContextGet');
const sendEventUpdate = require('./lib/sendEventUpdate');
const sendEventChangeState = require('./lib/sendEventChangeState');
const addEventUpdateActivity = require('./lib/addEventUpdateActivity');
const addEventAggregationActivity = require('./lib/addEventAggregationActivity');

function haveRealDiff(before, after) {
  return _.uniq([...Object.keys(before), ...Object.keys(after)])
    .filter(key => ['createdAt', 'updatedAt', 'state'].includes(key) && before[key] !== after[key])
    .length > 0;
}

module.exports = async ({ config, services }, before, after, context) => {
  const {
    legacy: legacySvc,
    elasticsearch: legacyEventSearch
  } = services;

  const controlDataSvc = legacySvc.controlData;

  log('updated agenda-event from %j to %j, %j', before, after, _.pick(context, ['legacy', 'aggregated', 'batched', 'stateChangeType']));

  const { agenda, event, user } = await fallbackContextGet({ services }, 'onUpdate', after, context);

  if (after.state === 2) {
    try {
      await controlDataSvc.set(after, event);
    } catch (e) {
      log('error', 'control data set failed', e);
    }
  } else if ((before.state === 2) && (after.state !== 2)) {
    try {
      await controlDataSvc.remove(before);
    } catch (e) {
      log('error', 'control data remove failed', e);
    }
  }

  // source added
  if ((after.sourcePaths?.length || 0) > (before.sourcePaths?.length || 0)) {
    try {
      await addEventAggregationActivity(
        services,
        { entityType: 'event', entityUid: event.uid },
        { agenda, event, ae: after },
        context
      );
    } catch (e) {
      log('error', e);
    }
  }

  if (context.aggregated) {
    try {
      await legacyEventSearch.updateEvent(_.pick(event, ['uid']));
    } catch (e) {
      log('error', 'could not update legacy search for event %s', event.slug);
    }
  }

  if (!haveRealDiff(before, after)) {
    return;
  }

  // Send emails
  if (before.state === after.state) {
    // eventUpdate
    // myEventUpdate
    try {
      await sendEventUpdate({ config, services }, {
        agendaEvent: after, before, context, agenda, event
      });
    } catch (error) {
      log.error(new VError(error, 'Cannot send event update emails'));
    }
  } else {
    // eventChangeState
    // myEventChangeState
    try {
      await sendEventChangeState({ config, services }, {
        agendaEvent: after, before, context, agenda, event
      });
    } catch (error) {
      log.error(new VError(error, 'Cannot send event change state emails'));
    }
  }

  if (user) {
    try {
      await addEventUpdateActivity(services, { agenda, event, user }, before, after, context.stateChangeType);
    } catch (e) {
      log.error(new VError(e, 'Cannot create state change activities'));
    }
  }
};
