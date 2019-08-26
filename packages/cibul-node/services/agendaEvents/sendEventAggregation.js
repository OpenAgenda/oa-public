"use strict";

const { promisify } = require( 'util' );
const _ = require( 'lodash' );
const mails = require( '@openagenda/mails' );
const agendasSvc = require( '@openagenda/agendas' );
const membersSvc = require( '@openagenda/agenda-stakeholders' );
const agendaEventStates = require( '@openagenda/agenda-events/iso/states' );
const usersSvc = require( '../users' );
const genUrl = require( '../genUrl' );

const log = require( '@openagenda/logs' )( 'services/agendaEvents/sendEventAggregation' );

module.exports = async ( { agendaEvent, context } ) => {

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
  const creator = await promisify( membersSvc.agenda( originAgenda.id ).get )( { userId: creatorUser.id } );
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
