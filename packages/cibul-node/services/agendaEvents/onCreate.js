"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/onCreate' );

const activitiesSvc = require( '@openagenda/activities' );
const custom = require( '@openagenda/custom' );
const stakeholdersSvc = require( '@openagenda/agenda-stakeholders' );
const usersSvc = require( '@openagenda/users' );

const aggregator = require( '../aggregator' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const eventAggregation = require( './eventAggregation' );
const eventSearch = require( '../eventSearch' );
const fallbackContextGet = require( './lib/fallbackContextGet' );
const queueForControlData = require( './lib/queueForControlData' );
const sendEventCreation = require( './sendEventCreation' );
const sendEventAggregation = require( './sendEventAggregation' );

module.exports = async ( ae, context ) => {

  log( 'created agenda-event %j', ae );

  // use context.userUid. will be null when nothing was specified at create

  const { agenda, event } = await fallbackContextGet( 'onCreate', ae, context );

  let user;

  if ( !context.aggregated ) {
    if ( ae.agendaUid === context.event.agendaUid ) {
      // Creation
      try {
        await sendEventCreation( { agendaEvent: ae, context } );
      } catch ( error ) {
        log.error( new VError( error, 'Cannot send event creation emails' ) )
      }
    } else {
      // Sharing
      console.log( '==================' );
      console.log( 'send mail SHARING' );
      //   myEventShare to creator                  [ 'receive', 'myEventShare' ]
      //   eventShare to adminmods (- creator)      [ 'receive', 'eventShare' ]
    }
  } else if ( context.aggregated ) {
    // Aggregation
    try {
      await sendEventAggregation( { agendaEvent: ae, context } );
    } catch ( error ) {
      log.error( new VError( error, 'Cannot send event aggregation emails' ) )
    }
  }

  // if reference was created through aggregation, email administrators
  if ( context.aggregated && agenda.settings.mailing && agenda.settings.mailing.eventAggregation ) {

    log( 'queuing mail send for admins of agenda %s for aggregation of event %s', agenda.uid, event.uid );

    eventAggregation( {
      eventUid: event.uid,
      aggregatorAgendaUid: agenda.uid,
      sourceAgendaUid: context.sourceAgenda.uid,
      state: ae.state
    } ).catch( error => log.error( 'Error on sending \'eventAggregation\' email', error ) );

  }


  if ( context.legacy && agenda.formSchemaId ) {

    // this happens after llegacy reference was added
    await custom( agenda.formSchemaId ).transferFromLegacy( event.uid, _.get( agenda, 'id' ) );

  }


  if ( !context.legacy ) {

    /**
     * Anything happening here should NOT be triggered elsewhere by legacy parts of app
     */

    coms.publish( config.mainChannel, {
      name: 'legacy.es.event.create',
      values: {
        uid: event.uid,
        type: 'create'
      }
    } );

  }

  if ( !context.legacy && ae.state === 2 ) {

    aggregator.notifyPublish( event.id, agenda.id );

  }


  /**
   * control data is used for didsplaying widget data
   */

   if ( ae.state === 2 ) queueForControlData( 'agendaEvent.onCreate', agenda, event );

  _addToSearchIndex( ae );

  // currently for logging only. Not used yet for actual aggregation
  if ( ae.state === 2 ) {

    aggregator.notify( 'create', {
      event,
      agendaEvent: ae,
      agenda
    } );

  }


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

    if ( context.userUid ) {
      try {
        user = await usersSvc.get( context.userUid );
      } catch ( err ) {
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
    if ( !context.aggregated ) {

      if ( ae.agendaUid === context.event.agendaUid ) {

        await _addCreateEventActivity( eventFeed, { agenda, event, user }, context );

      } else {

        console.log( 'CREATE SHARING ACTIVITY' );

      }

    } else if ( context.aggregated ) {

      await _addAggregateEventActivity( eventFeed, { agenda, event }, context );

    }

  } catch ( e ) {

    log( 'error', e );

  }

}

async function _addToSearchIndex( ae ) {

  const result = await eventSearch.agendas( ae.agendaUid ).add( ae );

  if ( !_.get( result, 'success' ) ) {

    log( 'warn', 'could not index event in agenda index', { agendaEvent: ae } );

  }

}

async function _addCreateEventActivity( eventFeed, { agenda, event, user }, context ) {

  if ( !user ) {
    return log( 'error', new VError( 'user of uid %s not found', context.userUid ) );
  }

  await activitiesSvc.feed( eventFeed ).activities.add( {
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
  } );

  await promisify( stakeholdersSvc.agenda( agenda.id ).increment )( { userId: user.id } );

}

async function _addAggregateEventActivity( eventFeed, { agenda, event }, context ) {

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
