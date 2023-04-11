'use strict';

const _ = require('lodash');
const VError = require('@openagenda/verror');

const log = require('@openagenda/logs')('agendaEvents/onCreate');

const fallbackContextGet = require('./lib/fallbackContextGet');
const sendEventCreation = require('./lib/sendEventCreation');
const sendEventAggregation = require('./lib/sendEventAggregation');
const sendEventAddition = require('./lib/sendEventAddition');
const addEventCreationActivity = require('./lib/addEventCreationActivity');
const addEventAggregationActivity = require('./lib/addEventAggregationActivity');
const addEventAdditionActivity = require('./lib/addEventAdditionActivity');

module.exports = async ({ config, services }, ae, context) => {
  const {
    activities: activitiesSvc,
    custom,
    legacy: {
      controlData: controlDataSvc,
    },
  } = services;

  services.tracker('agendaEvents.onCreate');
  log('created agenda-event %j', ae, _.pick(context, ['legacy', 'aggregated', 'batched']));

  // use context.userUid. will be null when nothing was specified at create
  const fallbackContext = await fallbackContextGet({ services }, 'onCreate', ae, context);

  const event = context.event || fallbackContext.event;
  const agenda = context.agenda || fallbackContext.agenda;
  const user = context.user || fallbackContext.user;
  Object.assign(context, { agenda, event, user });

  if (!event) {
    log('error', 'could not retrieve event', ae);
    return;
  }

  if (!context.aggregated) {
    if (ae.agendaUid === event.agendaUid) {
      // Creation
      try {
        await sendEventCreation({ config, services }, { agendaEvent: ae, context });
      } catch (error) {
        log.error(new VError(error, 'Cannot send event creation emails'));
      }
    } else {
      // Adding
      try {
        await sendEventAddition({ config, services }, { agendaEvent: ae, context, user });
      } catch (error) {
        log.error(new VError(error, 'Cannot send event addition emails'));
      }
    }
  }

  if (context.aggregated && !context.batched) {
    try {
      await sendEventAggregation({ config, services }, { agendaEvent: ae, context });
    } catch (error) {
      log.error(new VError(error, 'Cannot send event aggregation emails'));
    }
  }

  if (context.legacy && context.aggregated && agenda.formSchemaId) {
    // this happens after legacy reference was added
    try {
      await custom(agenda.formSchemaId).transferFromLegacy(event.uid, _.get(agenda, 'id'));
    } catch (e) {
      log('error', 'could not transfer custom data from legacy (%s.%s)', ae.agendaUid, ae.eventUid, e);
    }
  }

  /**
   * control data is used for displaying widget data
   */

  if (ae.state === 2) {
    try {
      await controlDataSvc.set(ae, event);
    } catch (e) {
      log('error', 'control data set failed', e);
    }
  }

  if (!activitiesSvc) {
    log('warn', 'activities service was not initialized');
    return;
  }

  try {
    let eventFeed = {
      entityType: 'event',
      entityUid: event.uid,
    };

    try {
      eventFeed = await activitiesSvc.feed(eventFeed).create();
    } catch (err) {
      if (err.message !== 'Feed already exists') {
        log('error', err);
      }
    }

    try {
      await activitiesSvc.feed({
        entityType: 'agenda',
        entityUid: agenda.uid,
      }).follow(eventFeed);

      if (user) {
        await activitiesSvc.feed({
          entityType: 'user',
          entityUid: user.uid,
        }).follow(eventFeed);
      }
    } catch (err) {
      if (err.message !== 'Feed already followed') {
        log('error', err);
      }
    }

    if (context.aggregated) {
      await addEventAggregationActivity(services, eventFeed, { agenda, event, ae }, context);
    } else if (ae.agendaUid === event.agendaUid) {
      await addEventCreationActivity(services, eventFeed, {
        agenda,
        event,
        ae,
        user,
      }, context);
    } else {
      await addEventAdditionActivity(
        services,
        eventFeed,
        {
          agenda,
          event,
          user,
          ae,
        },
        context,
      );
    }
  } catch (e) {
    log('error', e);
  }
};
