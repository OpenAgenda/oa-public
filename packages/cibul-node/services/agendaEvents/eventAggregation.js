"use strict";

const wn = require( 'when/node' );
const _ = require( 'lodash' );
const agendasSvc = require( '@openagenda/agendas' );
const stakeholders = require( '@openagenda/agenda-stakeholders' );
const eventSvc = require( '@openagenda/events' );
const usersSvc = require( '@openagenda/users' );
const mails = require( '@openagenda/mails' );
const agendaEventStates = require( '@openagenda/agenda-events/iso/states' );
const log = require( '@openagenda/logs' )( 'services/agendaEvents/eventAggregation' );
const genUrl = require( '../genUrl' );


module.exports = async ( { eventUid, aggregatorAgendaUid, sourceAgendaUid, state } ) => {

  try {

    const event = await wn.call( eventSvc.get, { uid: eventUid } );

    const aggregatorAgenda = await wn.call(
      agendasSvc.get,
      { uid: aggregatorAgendaUid },
      { private: null, internal: true, includeImagePath: true }
    );

    const sourceAgenda = await wn.call(
      agendasSvc.get,
      { uid: sourceAgendaUid },
      { private: null, internal: true, includeImagePath: true }
    );

    const members = ( await wn.call(
      stakeholders( aggregatorAgenda.id ).list,
      { credentials: [ 'administrator', 'moderator' ] },
      0,
      100
    ) )[ 0 ];

    const users = (await usersSvc.find( {
      query: {
        id: {
          $in: members.map( m => m.userId )
        },
        $limit: 100
      },
      detailed: true
    } ) )
      .data
      .filter( u => !!u.email );

    log( 'sending mails to %s adminmods to notify aggregation %s -> %s', users.length, sourceAgenda.title, aggregatorAgenda.title )

    for ( let user of users ) {

      await _sendEmail( user, aggregatorAgenda, sourceAgenda, event, state );

    }

  } catch ( e ) {

    log( 'error', e );

  }

}


function _sendEmail( user, agenda, sourceAgenda, event, state ) {

  let stateLabel;

  const lang = user.culture || 'fr';

  const eventTitle = _.find( event.title );

  const link = genUrl( 'agendaEventShow', {
    slug: agenda.slug,
    eventSlug: event.slug
  }, { abs: true } );

  switch ( state ) {
    case agendaEventStates.TOCONTROL:
      stateLabel = 'toBeControlled';
      break;
    case agendaEventStates.CONTROLLED:
      stateLabel = 'readyToPublish';
      break;
    case agendaEventStates.PUBLISHED:
      stateLabel = 'published';
      break;
  }

  const logo = agenda && agenda.image
    ? { src: agenda.image.replace( '.com/', '.com/rwtb' ), width: '100px' }
    : { src: 'https://openagenda.com/images/openagenda.png', width: '300px' };

  return mails( {
    template: 'eventAggregation',
    to: user.email,
    lang,
    data: {
      logo,
      link,
      agenda: agenda.title,
      event: eventTitle,
      sourceAgenda: sourceAgenda.title,
      state: stateLabel
    }
  } );

}
