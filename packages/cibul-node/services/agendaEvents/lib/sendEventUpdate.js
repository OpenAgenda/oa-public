"use strict";

const _ = require( 'lodash' );

const agendaEventStates = require( '@openagenda/agenda-events/iso/states' );
const log = require( '@openagenda/logs' )( 'agendaEvents/sendEventUpdate' );
const mails = require( '@openagenda/mails' );

const membersSvc = require( '../../members' );
const usersSvc = require( '../../users' );
const genUrl = require( '../../genUrl' );

const agendaLogo = require('./utils/agendaLogo');
const eventLink = require('./utils/eventLink');
const listAdminMods = require('./utils/listAdminMods').bind(null, membersSvc);

module.exports = async ({ root }, { agendaEvent, context, agenda, event }) => {
  log('processing');
  if (_.get(context, 'batched')) {
    log('part of batch, not sending event update emails');
    return;
  }

  let stateLabel;

  const link = eventLink(root, agenda, event);

  switch ( agendaEvent.state ) {
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

  const logo = agendaLogo(agenda);

  const members = await listAdminMods(agenda.uid);

  const creatorUser = await usersSvc.findOne({
    query: { uid: event.creatorUid }
  });
  const creator = await membersSvc.get({
    agendaUid: agenda.uid,
    userUid: creatorUser.uid
  });
  const creatorLang = creatorUser.culture || 'fr';

  if (!creator) {
    log( 'creator member was not found for user of uid % in agenda %s', event.creatorUid, agenda.slug );
  } else if (agendaEvent.agendaUid === event.agendaUid) {

     await mails( {
      template: 'myEventUpdate',
      to: {
        address: creatorUser.email,
        unsubscriptions: [ {
          rule: [ 'receive', 'myEventUpdate' ],
          dataPath: 'unsubscribeLink'
        }, {
          memberId: creator.id,
          rule: [ 'receive', 'myEventUpdate' ],
          dataPath: 'memberUnsubscribeLink'
        } ]
      },
      data: {
        event: event.title[ creatorLang ] || _.find( event.title ),
        agenda: agenda.title,
        state: stateLabel,
        logo,
        link
      },
      lang: creatorLang
    } );

  }

  await mails( {
    template: 'eventUpdate',
    to: members
      .filter( member => !!member.user )
      .filter( member => !creator || ( member.id !== creator.id ) )
      .map( member => {
        const lang = member.user.culture || 'fr';
        const eventTitle = event.title[ lang ] || _.find( event.title );

        return {
          address: member.user.email,
          lang: member.user.culture,
          unsubscriptions: [ {
            rule: [ 'receive', 'eventUpdate' ],
            dataPath: 'unsubscribeLink'
          }, {
            memberId: member.id,
            rule: [ 'receive', 'eventUpdate' ],
            dataPath: 'memberUnsubscribeLink'
          } ],
          data: {
            event: eventTitle
          }
        };
      } ),
    data: {
      agenda: agenda.title,
      state: stateLabel,
      logo,
      link
    }
  } );
  log('done');
};
