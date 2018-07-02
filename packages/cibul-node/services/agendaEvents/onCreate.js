"use strict";

const _ = require( 'lodash' );
const wn = require( 'when/node' );

const agendasSvc = require( '@openagenda/agendas' );
const custom = require( '@openagenda/custom' );

const aggregator = require( '../aggregator' );
const coms = require( '../../lib/coms' );
const config = require( '../../config' );
const eventSearch = require( '../eventSearch' );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/onCreate' );
const mailContributor = require( '../event/instance/mailContributor' );
const mailer = require( '../mailer' );
const oldEventSvc = require( '../event' );

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

    mailer.queue.eventAggregation( {
      eventUid: event.uid,
      aggregatorAgendaUid: agenda.uid,
      sourceAgendaUid: context.agendaUid,
      state: ae.state
    } );

  }


  if ( context.legacy ) {

    if ( agenda.formSchemaId ) await custom( agenda.formSchemaId ).transferFromLegacy( event.uid, _.get( agenda, 'id' ) );

  } else {

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

    aggregator.notifyPublish( event.id, agenda.id );

  }

  _addToSearchIndex( ae );

}

async function _addToSearchIndex( ae ) {

  const result = await eventSearch.agendas( ae.agendaUid ).add( ae );

  if ( !_.get( result, 'success' ) ) {

    log( 'warn', 'could not index event in agenda index', { agendaEvent: ae } );

  }

}