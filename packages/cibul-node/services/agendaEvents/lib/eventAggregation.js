"use strict";

const _ = require('lodash');
const agendas = require('@openagenda/agendas');
const eventSvc = require('@openagenda/events');
const mails = require('@openagenda/mails');
const agendaEventStates = require('@openagenda/agenda-events/iso/states');

const log = require('@openagenda/logs')('agendaEvents/eventAggregation');

const membersSvc = require('../../members');

module.exports = async (config, { eventUid, aggregatorAgendaUid, sourceAgendaUid, state }) => {
  try {
    const event = await eventSvc.get({ uid: eventUid });

    const aggregatorAgenda = await agendas.get({
      uid: aggregatorAgendaUid
    }, { private: null, internal: true, includeImagePath: true });

    const sourceAgenda = await agendas.get({
      uid: sourceAgendaUid
    }, { private: null, internal: true, includeImagePath: true });

    const members = await membersSvc.list({
      agendaUid: aggregatorAgenda.uid,
      role: ['moderator', 'administrator']
    }, { limit: 100 }, { detailed: true });

    log(
      'sending mails to %s adminmods to notify aggregation %s -> %s',
      members.length,
      sourceAgenda.title,
      aggregatorAgenda.title
    );

    for (let member of members) {
      await _sendEmail(config, member, aggregatorAgenda, sourceAgenda, event, state);
    }
  } catch (e) {
    log('error', e);
  }
}


function _sendEmail({ root }, member, agenda, sourceAgenda, event, state) {
  let stateLabel;

  const lang = member.user.culture || 'fr';

  const eventTitle = event.title[ lang ] || _.find( event.title );

  const link = `${root}/${agenda.slug}/events/${event.slug}`;

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
