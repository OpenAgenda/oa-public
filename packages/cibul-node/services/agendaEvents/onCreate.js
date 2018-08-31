"use strict";

const _ = require( 'lodash' );
const wn = require( 'when/node' );

const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/onCreate' );

const activitiesSvc = require( '@openagenda/activities' );
const agendasSvc = require( '@openagenda/agendas' );
const custom = require( '@openagenda/custom' );
const stakeholdersSvc = require( '@openagenda/agenda-stakeholders' );
const usersSvc = require( '@openagenda/users' );

const aggregator = require( '../aggregator' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const eventSearch = require( '../eventSearch' );
const mailContributor = require( '../event/instance/mailContributor' );
const eventAggregation = require( './eventAggregation' );
const oldEventSvc = require( '../event' );

const controlData = require( '../agenda/controlData' );

module.exports = async ( ae, context ) => {

  log( 'created agenda-event %j', ae, { context } );

  // use context.userUid. will be null when nothing was specified at create

  const agenda = await wn.call( agendasSvc.get, { uid: ae.agendaUid }, { internal: true, private: null } );

  const event = await wn.call( oldEventSvc.get, { uid: ae.eventUid, reviewId: agenda.id } );

  if ( ae.state === 2 ) {

    mailContributor( event, agenda );

  }

  // if reference was created through aggregation, email administrators
  if ( context && context.agendaUid && agenda.settings.mailing && agenda.settings.mailing.eventAggregation ) {

    log( 'queuing mail send for admins of agenda %s for aggregation of event %s', agenda.uid, event.uid );

    eventAggregation( {
      eventUid: event.uid,
      aggregatorAgendaUid: agenda.uid,
      sourceAgendaUid: context.agendaUid,
      state: ae.state
    } ).catch( error => log.error( 'Error on sending \'eventAggregation\' email', error ) );

  }


  if ( context.legacy && agenda.formSchemaId ) {

    // this happens after llegacy reference was added
    await custom( agenda.formSchemaId ).transferFromLegacy( event.uid, _.get( agenda, 'id' ) );

  } 


  if ( !context.legacy ) {

    /**
     * Anything happening hear should NOT be triggered elsewhere by legacy parts of app
     */

    coms.publish( config.mainChannel, {
      name: 'legacy.es.event.create',
      values: {
        id: event.id,
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
  
  if ( ae.state === 2 && agenda && event ) {

    controlData.queue( agenda.id, {
      type: 'eventUpdate',
      eventId: event.id
    } );

  }

  _addToSearchIndex( ae );

  // If it's a real creation, not an agregation
  if ( context.userUid && !context.agendaUid ) {
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

      await activitiesSvc.feed( {
        entityType: 'agenda',
        entityUid: agenda.uid,
      } )
        .follow( eventFeed );

      _addCreateEventActivity( eventFeed, { agenda, event }, context );
    } catch ( e ) {
      log( 'error', e );
    }
  }

}

async function _addToSearchIndex( ae ) {

  const result = await eventSearch.agendas( ae.agendaUid ).add( ae );

  if ( !_.get( result, 'success' ) ) {

    log( 'warn', 'could not index event in agenda index', { agendaEvent: ae } );

  }

}

function _addCreateEventActivity( eventFeed, { agenda, event }, context ) {

  usersSvc.get( context.userUid )
    .then( user => {

      if ( !user ) {

        return log( 'error', new VError( 'user of uid %s not found', context.userUid ) );

      }

      activitiesSvc.feed( {
        entityType: 'user',
        entityUid: user.uid
      } ).follow( eventFeed, err => {

        if ( err ) log( 'error', err );

        activitiesSvc.feed( eventFeed ).activities.add( {
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
        }, err => {

          if ( err ) log( 'error', err );

          stakeholdersSvc.agenda( agenda.id ).increment( { userId: user.id }, err => {

            if ( err ) log( 'error', err );

          } );

        } );

      } );

    } )
    .catch( err => {

      log( 'error', err );

    } );

}
