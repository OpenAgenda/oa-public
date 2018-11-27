"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const mails = require( '@openagenda/mails' );
const membersSvc = require( '@openagenda/agenda-stakeholders' );
const usersSvc = require( '@openagenda/users' );
const agendaEventStates = require( '@openagenda/agenda-events/iso/states' );
const genUrl = require( '../genUrl' );


module.exports = async ( { agenda, event, agendaEvent, before } ) => {

  const contributorUser = await usersSvc.findOne( { query: { uid: agendaEvent.userUid } } );
  const contributor = await promisify( membersSvc.agenda( agenda.id ).get )( { userId: contributorUser.id } );
  const conributorLang = contributorUser.culture || 'fr';

  const afterStateLabel = getStateLabel( agendaEvent.state );
  const beforeStateLabel = getStateLabel( before.state );

  const link = genUrl( 'agendaEventShow', {
    slug: agenda.slug,
    eventSlug: event.slug
  }, { abs: true } );

  const logo = agenda && agenda.image
    ? { src: agenda.image.replace( '.com/', '.com/rwtb' ), width: '100px' }
    : { src: 'https://openagenda.com/images/openagenda.png', width: '300px' };

  const members = await listAdminmods( { agenda } );

  console.log( 'beforeState', beforeStateLabel );

  await mails( {
    template: 'myEventChangeState',
    to: {
      address: contributorUser.email,
      unsubscriptions: [ {
        rule: [ 'receive', 'myEventChangeState' ],
        dataPath: 'unsubscribeLink'
      }, {
        memberId: contributor.id,
        rule: [ 'receive', 'myEventChangeState' ],
        dataPath: 'memberUnsubscribeLink'
      } ]
    },
    data: {
      event: event.title[ conributorLang ] || _.find( event.title ),
      agenda: agenda.title,
      beforeState: beforeStateLabel,
      afterState: afterStateLabel,
      logo,
      link
    },
    lang: conributorLang
  } );

  await mails( {
    template: 'eventChangeState',
    to: members
      .filter( member => member.id !== contributor.id )
      .map( member => {
        const lang = member.user.culture || 'fr';
        const eventTitle = event.title[ lang ] || _.find( event.title );

        return {
          address: member.user.email,
          lang: member.user.culture,
          unsubscriptions: [ {
            rule: [ 'receive', 'eventChangeState', { state: agendaEvent.state } ],
            dataPath: 'unsubscribeLink'
          }, {
            memberId: member.id,
            rule: [ 'receive', 'eventChangeState', { state: agendaEvent.state } ],
            dataPath: 'memberUnsubscribeLink'
          } ],
          data: {
            event: eventTitle
          }
        };
      } ),
    data: {
      agenda: agenda.title,
      beforeState: beforeStateLabel,
      afterState: afterStateLabel,
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

function getStateLabel( state ) {
  switch ( state ) {
    case agendaEventStates.REFUSED:
      return 'refused';
    case agendaEventStates.TOCONTROL:
      return 'tocontrol';
    case agendaEventStates.CONTROLLED:
      return 'controlled';
    case agendaEventStates.PUBLISHED:
      return 'published';
  }
}
