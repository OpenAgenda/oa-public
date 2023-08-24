'use strict';

const _ = require('lodash');
const VError = require('@openagenda/verror');

const log = require('@openagenda/logs')('agendaEvents/onUpdate');

const fallbackContextGet = require('./lib/fallbackContextGet');
const sendEventChangeState = require('./lib/sendEventChangeState');
const addEventUpdateActivity = require('./lib/addEventUpdateActivity');
const addEventAggregationActivity = require('./lib/addEventAggregationActivity');

module.exports = async ({ config, services }, before, after, context) => {
  const {
    legacy: legacySvc,
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
      await sendEventChangeState({ config, services }, {
        agendaEvent: after, before, context, agenda, event,
      });
    } catch (error) {
      log.error(new VError(error, 'Cannot send event change state emails'));
    }
  }

  if (stateChanged && user) {
    try {
      await addEventUpdateActivity(services, { agenda, event, user }, before, after, context.stateChangeType);
    } catch (e) {
      log.error(new VError(e, 'Cannot create state change activities'));
    }
  }
};
