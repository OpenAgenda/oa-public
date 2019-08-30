"use strict";

const _ = require( 'lodash' );
const mails = require( '@openagenda/mails' );
const agendas = require( '@openagenda/agendas' );
const agendaEventStates = require( '@openagenda/agenda-events/iso/states' );
const membersSvc = require( '../../members' );
const usersSvc = require( '../../users' );

const agendaLogo = require('./utils/agendaLogo');
const eventLink = require('./utils/eventLink');
const listAdminMods = require('./utils/listAdminMods').bind(null, membersSvc);

const log = require( '@openagenda/logs' )( 'agendaEvents/sendEventAggregation' );

module.exports = async ({ root }, { agendaEvent, context }) => {
  log('processing');
  const { sourceAgenda, agenda, event } = context;
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

  const originAgenda = await agendas.get({
    uid: event.agendaUid
  }, { private: null, internal: true, includeImagePath: true });
  const creatorUser = await usersSvc.findOne( { query: { uid: event.creatorUid } } );
  const creator = await membersSvc.get( {
    agendaUid: originAgenda.uid,
    userUid: creatorUser.uid
  } );
  const creatorLang = creatorUser.culture || 'fr';

  if ( !agenda.private ) {
    await mails( {
      template: 'myEventAggregation',
      to: {
        address: creatorUser.email,
        unsubscriptions: [ {
          rule: [ 'receive', 'myEventAggregation' ],
          dataPath: 'unsubscribeLink'
        }, {
          memberId: creator.id,
          rule: [ 'receive', 'myEventAggregation' ],
          dataPath: 'memberUnsubscribeLink'
        } ]
      },
      data: {
        event: event.title[ creatorLang ] || _.find( event.title ),
        agenda: agenda.title,
        state: stateLabel,
        logo,
        link,
        sourceAgenda: sourceAgenda.title
      },
      lang: creatorLang
    } );
  }

  await mails( {
    template: 'eventAggregation',
    to: members
      .filter( member => member.user && member.user.uid !== creatorUser.uid )
      .filter( member => {
        if ( !member.user ) {
          log( 'warn', 'no user was found matching member %s', member.id );
        }
        return !!member.user;
      } )
      .map( member => {
        const lang = member.user.culture || 'fr';
        const eventTitle = event.title[ lang ] || _.find( event.title );

        return {
          address: member.user.email,
          lang: member.user.culture,
          unsubscriptions: [ {
            rule: [ 'receive', 'eventAggregation' ],
            dataPath: 'unsubscribeLink'
          }, {
            memberId: member.id,
            rule: [ 'receive', 'eventAggregation' ],
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
      link,
      sourceAgenda: sourceAgenda.title
    }
  } );
  log('done');
};
