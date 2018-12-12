"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const mails = require( '@openagenda/mails' );
const membersSvc = require( '@openagenda/agenda-stakeholders' );
const usersSvc = require( '@openagenda/users' );
const agendaEventStates = require( '@openagenda/agenda-events/iso/states' );
const genUrl = require( '../../genUrl' );


module.exports = async ( { agendaEvent, context, agenda, event } ) => {

  let stateLabel;

  // const { agenda, event } = context;
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

  const creatorUser = await usersSvc.findOne( { query: { uid: event.creatorUid } } );
  const creator = await promisify( membersSvc.agenda( agenda.id ).get )( { userId: creatorUser.id } );
  const creatorLang = creatorUser.culture || 'fr';

  if ( agendaEvent.agendaUid === event.agendaUid ) {
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
      .filter( member => member.id !== creator.id )
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


};

async function listAdminmods( { agenda } ) {
  let offset = 0;
  const members = [];
  let result;

  const _list = promisify( membersSvc.agenda( agenda.id ).list );

  while ( ( result = await _list( { credentials: [ 3, 2 ] }, offset, 50, { detailed: true } ) ).length ) {
    Array.prototype.push.apply( members, result );

    offset += result.length;
  }

  return members;
}
