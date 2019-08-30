"use strict";

const _ = require( 'lodash' );
const mails = require( '@openagenda/mails' );
const agendaEventStates = require( '@openagenda/agenda-events/iso/states' );

const membersSvc = require( '../../members' );
const usersSvc = require( '../../users' );

const agendaLogo = require('./utils/agendaLogo');
const eventLink = require('./utils/eventLink');
const listAdminMods = require('./utils/listAdminMods').bind(null, membersSvc);

const log = require( '@openagenda/logs' )( 'agendaEvents/sendEventCreation' );

module.exports = async ({ root }, { agendaEvent, context }) => {
  log('processing');
  const { agenda, event } = context;
  const creatorUser = await usersSvc.findOne( { query: { uid: event.creatorUid } } );
  const creatorMemberId = await membersSvc.get( {
    agendaUid: agendaEvent.agendaUid,
    userUid: creatorUser.uid
  } ).then( r => r ? r.id : null );
  const creatorLang = creatorUser.culture || 'fr';

  if ( !creatorMemberId ) {
    log( 'warn', 'no member reference was retrieved', _.pick( agendaEvent, [ 'agendaUid', 'eventUid' ] ) );
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

  if ( creatorMemberId ) {
    await mails( {
      template: 'myEventCreation',
      to: {
        address: creatorUser.email,
        unsubscriptions: [ {
          rule: [ 'receive', 'myEventCreation' ],
          dataPath: 'unsubscribeLink'
        }, {
          memberId: creatorMemberId,
          rule: [ 'receive', 'myEventCreation' ],
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
    template: 'eventCreation',
    to: members
      .filter( member => member.user.uid !== creatorUser.uid )
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
            rule: [ 'receive', 'eventCreation' ],
            dataPath: 'unsubscribeLink'
          }, {
            memberId: member.id,
            rule: [ 'receive', 'eventCreation' ],
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
