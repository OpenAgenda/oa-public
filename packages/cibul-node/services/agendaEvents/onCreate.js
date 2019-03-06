"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'agendaEvents/onCreate' );

const activitiesSvc = require( '@openagenda/activities' );
const custom = require( '@openagenda/custom' );
const stakeholdersSvc = require( '@openagenda/agenda-stakeholders' );
const usersSvc = require( '@openagenda/users' );

const aggregatorNotify = require( './lib/aggregatorNotify' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const eventAggregation = require( './eventAggregation' );
const eventSearch = require( '../eventSearch' );
const fallbackContextGet = require( './lib/fallbackContextGet' );
const sendEventCreation = require( './sendEventCreation' );
const sendEventAggregation = require( './sendEventAggregation' );

const controlDataSvc = require( '../legacy' ).controlData;

module.exports = async ( ae, context ) => {

  log( 'created agenda-event %j', ae, _.pick( context, [ 'legacy' ] ) );

  // use context.userUid. will be null when nothing was specified at create

  const { agenda, event } = await fallbackContextGet( 'onCreate', ae, context );

  let user;

  if ( !context.aggregated ) {
    if ( ae.agendaUid === event.agendaUid ) {
      // Creation
      try {
        await sendEventCreation( { agendaEvent: ae, context } );
      } catch ( error ) {
        log.error( new VError( error, 'Cannot send event creation emails' ) )
      }
    } else {
      // Sharing
      log( '==================' );
      log( 'send mail SHARING' );
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

    // this happens after legacy reference was added
    try {

      await custom( agenda.formSchemaId ).transferFromLegacy( event.uid, _.get( agenda, 'id' ) );

    } catch ( e ) {

      log( 'error', 'could not transfer custom data to legacy (%s.%s)', ae.agendaUid, ae.eventUid, e );

    }

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

      if ( ae.agendaUid === event.agendaUid ) {

        await _addCreateEventActivity( eventFeed, { agenda, event, user }, context );

      } else {

        log( 'CREATE SHARING ACTIVITY' );

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

    log( 'warn', 'could not index event in agenda index (%s.%s)', ae.agendaUid, ae.eventUid );

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
