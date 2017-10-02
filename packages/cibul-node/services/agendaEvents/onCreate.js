let log = console.log;

const wn = require( 'when/node' );
const agendasSvc = require( 'agendas' );
const eventSearch = require( '../eventSearch' );
const oldEventSvc = require( '../event' );
const mailContributor = require( '../event/instance/mailContributor' );

const mailer = require( '../mailer' );

module.exports = async ( ae, context ) => {

  log( 'created agenda-event %s with context %s', JSON.stringify( ae ), JSON.stringify( context ) );

  eventSearch.agendas( ae.agendaUid ).add( ae.eventUid );

  // use context.userUid. will be null when nothing was specified at create

  const agenda = await wn.call( agendasSvc.get, { uid: ae.agendaUid }, { internal: true } );
  const event = await wn.call( oldEventSvc.get, { uid: ae.eventUid, reviewId: agenda.id } );

  if ( ae.state === 2 ) {

    mailContributor( event, agenda );

  }

  // if reference was created through aggregation, email administrators
  if ( context && context.agendaUid && agenda.settings.mailing.eventAggregation ) {

    mailer.queue.eventAggregation( {
      eventUid: event.uid,
      aggregatorAgendaUid: agenda.uid,
      sourceAgendaUid: context.agendaUid,
      state: ae.state
    } );

  }

}

module.exports.setLog = l => log = l;