"use strict";

const wn = require( 'when/node' );
const _ = require( 'lodash' );
const agendasSvc = require( '@openagenda/agendas' );
const stakeholders = require( '@openagenda/agenda-stakeholders' );
const eventSvc = require( '@openagenda/events' );
const mails = require( '@openagenda/mails' );
const agendaEventStates = require( '@openagenda/agenda-events/iso/states' );
const genUrl = require( '../genUrl' );

const log = require( '@openagenda/logs' )( 'services/agendaEvents/eventAggregation' );

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
      100,
      { detailed: true }
    ) )[ 0 ];

    log(
      'sending mails to %s adminmods to notify aggregation %s -> %s',
      members.length,
      sourceAgenda.title,
      aggregatorAgenda.title
    );

    for ( let member of members ) {

      await _sendEmail( member, aggregatorAgenda, sourceAgenda, event, state );

    }

  } catch ( e ) {

    log( 'error', e );

  }

}


function _sendEmail( member, agenda, sourceAgenda, event, state ) {

  let stateLabel;

  const lang = member.user.culture || 'fr';

  const eventTitle = event.title[ lang ] || _.find( event.title );

  const link = genUrl( 'agendaEventShow', {
    slug: agenda.slug,
    eventSlug: event.slug
  }, { abs: true } );

  switch ( state ) {
    case agendaEventStates.TOCONTROL:
      stateLabel = 'tocontrol';
      break;
    case agendaEventStates.CONTROLLED:
      stateLabel = 'controlled';
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
    to: {
      address: member.user.email,
      unsubscriptions: [ {
        rule: [ 'receive', 'eventAggregation' ],
        dataPath: 'unsubscribeLink'
      } ].concat( member && member.id ? [ {
        memberId: member.id,
        rule: [ 'receive', 'eventAggregation' ],
        dataPath: 'memberUnsubscribeLink'
      } ] : [] )
    },
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
