import _ from 'lodash';
import agendaEventStates from '@openagenda/agenda-events/iso/states.js';
import logs from '@openagenda/logs';
import agendaLogo from './utils/agendaLogo.mjs';
import eventLink from './utils/eventLink.mjs';

const log = logs('agendaEvents/sendEventCreation');

export default async ({ config, services }, { agendaEvent, context }) => {
  const {
    root,
  } = config;

  const {
    mails,
    users,
    members: membersSvc,
  } = services;

  log('processing');
  const { agenda, event } = context;
  if (!event.creatorUid) {
    throw new Error('event creator reference is missing');
  }
  const creatorUser = await users.findOne({ query: { uid: event.creatorUid } });
  const creatorMemberId = await membersSvc.get({
    agendaUid: agendaEvent.agendaUid,
    userUid: creatorUser.uid,
  }).then(r => (r ? r.id : null));
  const creatorLang = creatorUser.culture || 'fr';

  if (!creatorMemberId) {
    log('warn', 'no member reference was retrieved', _.pick(agendaEvent, ['agendaUid', 'eventUid']));
  }

  let stateLabel;

  const link = eventLink(root, agenda, event);

  switch (agendaEvent.state) {
    case agendaEventStates.CONTROLLED:
      stateLabel = 'controlled';
      break;
    case agendaEventStates.PUBLISHED:
      stateLabel = 'published';
      break;
    default:
      stateLabel = 'tocontrol';
      break;
  }

  const logo = agendaLogo(agenda);

  const members = await membersSvc.utils.listAllAdminMods(agenda.uid);

  if (!mails) {
    log('warn', 'mails service was not initialized');
    return;
  }

  if (creatorMemberId) {
    log('acting member is event creator, sending myEventCreation mail to %s', creatorUser.email);
    await mails.send({
      template: 'myEventCreation',
      to: {
        address: creatorUser.email,
        unsubscriptions: [
          {
            rule: ['receive', 'myEventCreation'],
            dataPath: 'unsubscribeLink',
          }, {
            memberId: creatorMemberId,
            rule: ['receive', 'myEventCreation'],
            dataPath: 'memberUnsubscribeLink',
          },
        ],
      },
      data: {
        event: event.title[creatorLang] || _.find(event.title),
        agenda: agenda.title,
        state: stateLabel,
        logo,
        link,
      },
      lang: creatorLang,
    });
  }

  const nonCreatorMembers = members.filter(member => member.user && member.user.uid !== creatorUser.uid);

  if (!nonCreatorMembers.length) {
    log('there are no members other than creator to send email to');
    return;
  }

  log('sending eventCreation email to %s members other than creator', nonCreatorMembers.length);

  await mails.send({
    template: 'eventCreation',
    to: nonCreatorMembers
      .filter(member => {
        if (!member.user) {
          log('warn', 'no user was found matching member %s', member.id);
        }

        return !!member.user;
      })
      .map(member => {
        const lang = member.user.culture || 'fr';
        const eventTitle = event.title[lang] || _.find(event.title);

        return {
          address: member.user.email,
          lang: member.user.culture,
          unsubscriptions: [
            {
              rule: ['receive', 'eventCreation'],
              dataPath: 'unsubscribeLink',
            }, {
              memberId: member.id,
              rule: ['receive', 'eventCreation'],
              dataPath: 'memberUnsubscribeLink',
            },
          ],
          data: {
            event: eventTitle,
          },
        };
      }),
    data: {
      agenda: agenda.title,
      state: stateLabel,
      logo,
      link,
    },
  });
  log('done');
};
