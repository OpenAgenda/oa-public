"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const mails = require( '@openagenda/mails' );
const agendasSvc = require( '@openagenda/agendas' );
const legacyMembersSvc = require( '@openagenda/agenda-stakeholders' );
const agendaEventStates = require( '@openagenda/agenda-events/iso/states' );
const usersSvc = require( '../users' );
const membersSvc = require( '../../services/members' );
const genUrl = require( '../genUrl' );

const log = require( '@openagenda/logs' )( 'services/agendaEvents/sendEventAddition' );

module.exports = async ( { agendaEvent, user, context } ) => {

  const { sourceAgenda, agenda, event } = context;
  let stateLabel;

  const link = genUrl( 'agendaEventShow', {
    slug: agenda.slug,
    eventSlug: event.slug
  }, { abs: true } );

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

  const logo = agenda && agenda.image
    ? { src: agenda.image.replace( '.com/', '.com/rwtb' ), width: '100px' }
    : { src: 'https://openagenda.com/images/openagenda.png', width: '300px' };

  const members = await listAdminmods( { agenda } );

  const originAgenda = await promisify( agendasSvc.get )( {
    uid: event.agendaUid
  }, { internal: true, private: null, includeImagePath: true } );
  const creatorUser = await usersSvc.findOne( { query: { uid: event.creatorUid } } );
  const creator = await promisify( legacyMembersSvc.agenda( originAgenda.id ).get )( { userId: creatorUser.id } );
  const creatorLang = creatorUser.culture || 'fr';

  const sharerMember = await membersSvc.get( { agendaUid: agenda.uid, userUid: context.userUid } );

  if ( !agenda.private ) {
    await mails( {
      template: 'myEventAddition',
      to: {
        address: creatorUser.email,
        unsubscriptions: [ {
          rule: [ 'receive', 'myEventAddition' ],
          dataPath: 'unsubscribeLink'
        }, {
          memberId: creator.id,
          rule: [ 'receive', 'myEventAddition' ],
          dataPath: 'memberUnsubscribeLink'
        } ]
      },
      data: {
        user: sharerMember.custom.contactName || user.fullName,
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
    template: 'eventAddition',
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
            rule: [ 'receive', 'eventAddition' ],
            dataPath: 'unsubscribeLink'
          }, {
            memberId: member.id,
            rule: [ 'receive', 'eventAddition' ],
            dataPath: 'memberUnsubscribeLink'
          } ],
          data: {
            event: eventTitle
          }
        };
      } ),
    data: {
      user: sharerMember.custom.contactName || user.fullName,
      agenda: agenda.title,
      state: stateLabel,
      logo,
      link,
      sourceAgenda: sourceAgenda.title
    }
  } );

};


async function listAdminmods( { agenda } ) {
  let offset = 0;
  const members = [];
  let result;

  const _list = promisify( legacyMembersSvc.agenda( agenda.id ).list );

  while ( ( result = await _list( { credentials: [ 3, 2 ] }, offset, 50, { detailed: true } ) ).length ) {
    Array.prototype.push.apply( members, result );

    offset += result.length;
  }

  return members;
}
