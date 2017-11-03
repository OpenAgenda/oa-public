"use strict";

const wn = require( 'when/node' );
const mailer = require( '../mailer' );
const agendasSvc = require( 'agendas' );
const oldEventSvc = require( '../event' );
const eventSearch = require( '../eventSearch' );
const mailContributor = require( '../event/instance/mailContributor' );
const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/onCreate' );


module.exports = async ( ae, context ) => {

  log( 'created agenda-event %j', ae, { context } );

  eventSearch.agendas( ae.agendaUid ).add( ae.eventUid, ae.state );

  // use context.userUid. will be null when nothing was specified at create

  const agenda = await wn.call( agendasSvc.get, { uid: ae.agendaUid }, { internal: true } );
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

}