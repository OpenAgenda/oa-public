"use strict";

const _ = require('lodash');
const agendasSvc = require('@openagenda/agendas');
const agendaEventStates = require('@openagenda/agenda-events/iso/states');

const log = require('@openagenda/logs')(
  'agendaEvents/sendEventAddition'
);

module.exports = async ({ config, services }, { agendaEvent, user, context }) => {
  const {
    root
  } = config;

  const {
    mails,
    users,
    members: membersSvc
  } = services;

  log('processing');

  const { sourceAgenda, agenda, event } = context;
  let stateLabel;

  const link = `${root}/${agenda.slug}/events/${event.slug}`;

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

  const members = await membersSvc.list({
    agendaUid: agenda.uid,
    roles: ['administrator','moderator']
  }, { limit: 1000 }, { detailed: true });

  const originAgenda = await agendasSvc.get({
    uid: event.agendaUid
  }, {
    internal: true,
    private: null,
    includeImagePath: true
  });

  const creatorUser = await users.findOne({
    query: {
      uid: event.creatorUid
    }
  });
  const creator = await membersSvc.get({
    agendaUid: originAgenda.uid,
    userUid: creatorUser.uid
  });
  const creatorLang = creatorUser.culture || 'fr';

  const sharerMember = !agenda.private && context.userUid ? await membersSvc.get({
    agendaUid: agenda.uid,
    userUid: context.userUid
  }) : null;

  if (!sharerMember) {
    log('no sharer member is defined, not sending email.');
    return;
  }

  if (!mails) {
    log('warn', 'mails service was not initialized');
    return;
  }

  const creatorIsInDestination = members.indexOf(member => member.user && member.user.uid !== creatorUser.uid) !== -1;
  const visibleForCreator = creatorIsInDestination
    || (!agenda.private && agendaEvent.state === agendaEventStates.PUBLISHED);

  if (visibleForCreator) {
    await mails.send({
      template: 'myEventAddition',
      to: {
        address: creatorUser.email,
        unsubscriptions: [
          {
            rule: ['receive', 'myEventAddition'],
            dataPath: 'unsubscribeLink'
          }, {
            memberId: creator.id,
            rule: ['receive', 'myEventAddition'],
            dataPath: 'memberUnsubscribeLink'
          }
        ]
      },
      data: {
        user: sharerMember.custom.contactName || user.fullName,
        event: event.title[creatorLang] || _.find(event.title),
        agenda: agenda.title,
        state: stateLabel,
        logo,
        link,
        sourceAgenda: sourceAgenda.title
      },
      lang: creatorLang
    });
  }

  if (!context.batched) {
    const targetedMembers = members.filter(member => (
      member.user
      && !(
        member.user.uid === creatorUser.uid && visibleForCreator
      )
    ));

    await mails.send( {
      template: 'eventAddition',
      to: targetedMembers
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
  }

  log('all good');
};
