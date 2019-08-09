"use strict";

const _ = require( 'lodash' );
const mails = require( '@openagenda/mails' );
const membersSvc = require( '../members' );
const usersSvc = require( '@openagenda/users' );
const agendaEventStates = require( '@openagenda/agenda-events/iso/states' );
const genUrl = require( '../genUrl' );

const log = require( '@openagenda/logs' )( 'services/agendaEvents/sendEventCreation' );

module.exports = async ( { agendaEvent, context } ) => {

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

  const members = await _listAdminMods( agenda.uid );

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


};

function _listAdminMods( agendaUid ) {
  return new Promise( ( rs, rj ) => {
    const stream = membersSvc.stream( {
      agendaUid,
      role: [ 'administrator', 'moderator' ],
      withUser: true
    }, {}, { detailed: true } );

    const members = [];

    stream.on( 'data', member => {
      members.push( member );
    } );
    stream.on( 'end', () => {
      rs( members );
    } );
    stream.on( 'error', rj );
  } );
}
