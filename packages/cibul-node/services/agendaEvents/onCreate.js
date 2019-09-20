"use strict";

const _ = require('lodash');
const VError = require('verror');

const log = require('@openagenda/logs' )( 'agendaEvents/onCreate');

const custom = require('@openagenda/custom');

const aggregatorNotify = require('./lib/aggregatorNotify');
const legacyEventSearch = require('../elasticsearch');
const eventSearch = require('../eventSearch');
const activitiesSvc = require('../activities');
const fallbackContextGet = require('./lib/fallbackContextGet');
const sendEventCreation = require('./lib/sendEventCreation');
const sendEventAggregation = require('./lib/sendEventAggregation');
const sendEventAddition = require('./lib/sendEventAddition');

const controlDataSvc = require('../legacy').controlData;
const membersSvc = require('../members');
const usersSvc = require('../users');

module.exports = async ( config, ae, context ) => {

  log('created agenda-event %j', ae, _.pick(context, ['legacy', 'aggregated']));

  // use context.userUid. will be null when nothing was specified at create

  const { agenda, event } = await fallbackContextGet( 'onCreate', ae, context );
  let user;

  context.agenda = context.agenda || agenda;
  context.event = context.event || event;

  if ( !event ) {

    log( 'error', 'could not retrieve event', ae );

    return;

  }

  if ( context.userUid ) {
    try {
      user = await usersSvc.get( context.userUid );
    } catch ( err ) {
      log( 'error', err );
    }
  }

  if ( !context.aggregated ) {
    if ( ae.agendaUid === event.agendaUid ) {
      // Creation
      try {
        await sendEventCreation(config, { agendaEvent: ae, context });
      } catch ( error ) {
        log.error( new VError( error, 'Cannot send event creation emails' ) );
      }
    } else {
      // Adding
      try {
        await sendEventAddition(config, { agendaEvent: ae, context, user });
      } catch (error) {
        log.error(new VError(error, 'Cannot send event addition emails'));
      }
    }
  } else if ( context.aggregated ) {
    // Aggregation
    try {
      await sendEventAggregation(config, { agendaEvent: ae, context });
    } catch ( error ) {
      log.error( new VError( error, 'Cannot send event aggregation emails' ) );
    }
  }

  if (context.legacy && context.aggregated && agenda.formSchemaId) {
    // this happens after legacy reference was added
    try {
      await custom( agenda.formSchemaId ).transferFromLegacy( event.uid, _.get( agenda, 'id' ) );
    } catch ( e ) {
      log( 'error', 'could not transfer custom data from legacy (%s.%s)', ae.agendaUid, ae.eventUid, e );
    }
  }

  if (context.legacy && context.aggregated) {
    try {
      await legacyEventSearch.updateEvent( _.pick( event, [ 'uid' ] ) );
    } catch ( e ) {
      log( 'error', 'could not update legacy search for event %s', event.slug );
    }
  }

  aggregatorNotify.create( { agenda, event, agendaEvent: ae } );


  /**
   * control data is used for displaying widget data
   */

  if ( ae.state === 2 ) {

    try {
      await controlDataSvc.set( ae, event );
    } catch ( e ) {
      log( 'error', 'control data set failed', e );
    }

  }

  _addToSearchIndex( ae );

  try {

    let eventFeed = {
      entityType: 'event',
      entityUid: event.uid,
    };

    try {
      eventFeed = await activitiesSvc.feed( eventFeed ).create();
    } catch ( err ) {
      if ( err.message !== 'Feed already exists' ) {
        log( 'error', err );
      }
    }

    try {
      await activitiesSvc.feed( {
        entityType: 'agenda',
        entityUid: agenda.uid,
      } )
        .follow( eventFeed );

      // TODO move next feed follow in events.onCreate ?
      if ( user ) {
        await activitiesSvc.feed( {
          entityType: 'user',
          entityUid: user.uid,
        } )
          .follow( eventFeed );
      }
    } catch ( err ) {
      if ( err.message !== 'Feed already followed' ) {
        log( 'error', err );
      }
    }

    // If it's a real creation, not an agregation
    if (!context.aggregated) {
      if (ae.agendaUid === event.agendaUid) {
        await _addEventCreationActivity(eventFeed, { agenda, event, user }, context);
      } else {
        await _addEventAdditionActivity(eventFeed, { agenda, event, user }, context);
      }
    } else if (context.aggregated) {
      await _addEventAggregationActivity(eventFeed, { agenda, event }, context);
    }

  } catch ( e ) {

    log( 'error', e );

  }

}

async function _addToSearchIndex( ae ) {

  const result = await eventSearch.agendas( ae.agendaUid ).add( ae );

  if ( !_.get( result, 'success' ) ) {

    log( 'warn', 'could not index event in agenda index (%s.%s)', ae.agendaUid, ae.eventUid );

  }

}

async function _addEventCreationActivity(eventFeed, { agenda, event, user }, context) {
  if (!user) {
    return log( 'error', new VError( 'user of uid %s not found', context.userUid ) );
  }

  await activitiesSvc.feed(eventFeed).activities.add({
    actor: 'user:' + user.uid,
    verb: 'event.create',
    object: 'event:' + event.uid,
    target: 'agenda:' + agenda.uid,
    store: {
      labels: {
        actor: user.fullName,
        object: event.title,
        target: agenda.title
      }
    }
  });

  await membersSvc.patch.actions.increment({
    agendaUid: agenda.uid,
    userUid: user.uid
  });
}

async function _addEventAggregationActivity(eventFeed, { agenda, event }, context) {
  const { sourceAgenda } = context;

  await activitiesSvc.feed( eventFeed ).activities.add( {
    actor: 'agenda:' + sourceAgenda.uid,
    verb: 'agenda.aggregateEvent',
    object: 'event:' + event.uid,
    target: 'agenda:' + agenda.uid, // aggregator
    store: {
      labels: {
        actor: sourceAgenda.title,
        object: event.title,
        target: agenda.title
      }
    }
  } );
}

async function _addEventAdditionActivity(eventFeed, { agenda, user, event }, context) {
  const { sourceAgenda } = context;

  await activitiesSvc.feed(eventFeed).activities.add( {
    actor: 'user:' + user.uid,
    verb: 'agenda.addEvent',
    object: 'event:' + event.uid,
    target: 'agenda:' + agenda.uid, // aggregator
    store: {
      labels: {
        actor: user.fullName,
        object: event.title,
        target: agenda.title,
        sourceAgenda: sourceAgenda.title
      },
      sourceAgenda: sourceAgenda.uid
    }
  } );
}
