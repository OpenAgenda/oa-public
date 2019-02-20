"use strict";

const _ = require( 'lodash' );
const { promisify } = require( 'util' );
const VError = require( 'verror' );

const agendaEventStates = require( '@openagenda/agenda-events/iso/states' );
const mails = require( '@openagenda/mails' );
const membersSvc = require( '@openagenda/agenda-stakeholders' );
const usersSvc = require( '@openagenda/users' );

const marked = require( 'marked' );

const genUrl = require( '../../genUrl' );

const log = require( '@openagenda/logs' )( 'agendaEvents/interfaces/sendEventChangeState' );


module.exports = async ( { agendaEvent, before, context, agenda, event } ) => {

  // const { agenda, event } = context;
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

  const contributorUser = await usersSvc.findOne( { query: { uid: agendaEvent.userUid } } );

  const contributor = contributorUser ? await promisify( membersSvc.agenda( agenda.id ).get )( { userId: contributorUser.id } ) : null;

  if ( agendaEvent.agendaUid === event.agendaUid ) {

    if ( !contributorUser ) {

      throw new VError( 'User matching agendaEvent.userUid %s was not found', _.get( agendaEvent, 'userUid' ) );

    } else {

      await _sendToContributor( {
        contributor,
        contributorUser,
        agendaEvent,
        agenda,
        event,
        logo,
        link,
        beforeStateLabel,
        afterStateLabel
      } );

    }

  }

  await mails( {
    template: 'eventChangeState',
    to: members
      .filter( member => member.id !== _.get( contributor, 'id' ) )
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


async function _sendToContributor( {
  contributor,
  contributorUser,
  agendaEvent,
  agenda,
  event,
  logo,
  link,
  beforeStateLabel,
  afterStateLabel
} ) {

  const conributorLang = contributorUser.culture || 'fr';

  const sendAgendaPublicationMessage = (
    agendaEvent.state === agendaEventStates.PUBLISHED
  ) && _.get( agenda, 'settings.contribution.messages.publication' );

  const to = {
    address: contributorUser.email,
    unsubscriptions: [ {
      rule: [ 'receive', 'myEventChangeState' ],
      dataPath: 'unsubscribeLink'
    }, {
      memberId: contributor.id,
      rule: [ 'receive', 'myEventChangeState' ],
      dataPath: 'memberUnsubscribeLink'
    } ]
  };

  const eventTitle = event.title[ conributorLang ] || _.find( event.title );

  const agendaTitle = agenda.title;

  if ( sendAgendaPublicationMessage ) {

    await mails( {
      template: 'eventPublishContributor',
      to,
      data: {
        eventTitle,
        agendaTitle,
        logo,
        link,
        message: marked( _.get( agenda, 'settings.contribution.messages.publication' ) )
      },
      lang: conributorLang
    } );

  } else {

    await mails( {
      template: 'myEventChangeState',
      to,
      data: {
        event: eventTitle,
        agenda: agendaTitle,
        beforeState: beforeStateLabel,
        afterState: afterStateLabel,
        logo,
        link
      },
      lang: conributorLang
    } );

  }

}

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
