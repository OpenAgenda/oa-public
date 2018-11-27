"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const mails = require( '@openagenda/mails' );
const membersSvc = require( '@openagenda/agenda-stakeholders' );
const usersSvc = require( '@openagenda/users' );
const agendaEventStates = require( '@openagenda/agenda-events/iso/states' );
const genUrl = require( '../genUrl' );


module.exports = async ( { agenda, event, agendaEvent } ) => {

  const creatorUser = await usersSvc.findOne( { query: { uid: agendaEvent.userUid } } );
  const creator = await promisify( membersSvc.agenda( agenda.id ).get )( { userId: creatorUser.id } );
  const creatorLang = creatorUser.culture || 'fr';

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

  await mails( {
    template: 'myEventCreation',
    to: {
      address: creatorUser.email,
      unsubscriptions: [ {
        rule: [ 'receive', 'myEventCreation' ],
        dataPath: 'unsubscribeLink'
      }, {
        memberId: creator.id,
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

  await mails( {
    template: 'eventCreation',
    to: members
      .filter( member => member.id !== creator.id )
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
