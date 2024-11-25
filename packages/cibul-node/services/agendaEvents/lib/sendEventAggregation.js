import _ from 'lodash';
import agendaEventStates from '@openagenda/agenda-events/iso/states.js';
import logs from '@openagenda/logs';
import agendaLogo from './utils/agendaLogo.js';
import eventLink from './utils/eventLink.js';
import getStateSlug from './utils/getStateSlug.js';

const log = logs('agendaEvents/sendEventAggregation');

async function getCreatorInfo(services, { agenda, event, agendaEvent }) {
  const { agendas, users: usersSvc, members: membersSvc } = services;

  const originAgenda = await agendas.get(
    {
      uid: event.agendaUid,
    },
    { private: null, internal: true, includeImagePath: true },
  );
  const creatorUser = await usersSvc.findOne({
    query: { uid: event.creatorUid },
  });

  if (!creatorUser) {
    return {
      creator: null,
      creatorUser: null,
      visibleForCreator: false,
    };
  }

  const creator = await membersSvc.get({
    agendaUid: originAgenda.uid,
    userUid: creatorUser.uid,
  });
  const isPublicPublishedEvent = !agenda.private && agendaEvent.state === agendaEventStates.PUBLISHED;

  return {
    creator,
    creatorUser,
    visibleForCreator: creator && isPublicPublishedEvent,
  };
}

export default async ({ config, services }, { agendaEvent, context }) => {
  const { root } = config;

  const { mails, members: membersSvc } = services;

  log('processing');
  const { sourceAgenda, agenda, event } = context;
  const link = eventLink(root, agenda, event);

  const stateLabel = getStateSlug(agendaEvent);

  const logo = agendaLogo(agenda);

  const members = await membersSvc.listAllAdminMods(agenda.uid);

  const { creator, creatorUser, visibleForCreator } = await getCreatorInfo(
    services,
    { agenda, event, agendaEvent },
  );

  const creatorIsInDestination = creatorUser
    && members.includes(
      (member) => member.user && member.user.uid !== creatorUser.uid,
    );

  if (creatorIsInDestination || visibleForCreator) {
    const creatorLang = creatorUser.culture || 'fr';

    await mails.send({
      template: 'myEventAggregation',
      to: {
        address: creatorUser.email,
        unsubscriptions: [
          {
            rule: ['receive', 'myEventAggregation'],
            dataPath: 'unsubscribeLink',
          },
          {
            memberId: creator.id,
            rule: ['receive', 'myEventAggregation'],
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
        contactLink: `${root}/${agenda.slug}/contact`,
        sourceAgenda: sourceAgenda.title,
      },
      lang: creatorLang,
    });
  }

  const targetedMembers = members.filter(
    (member) =>
      member.user
      && !(visibleForCreator && member.user.uid === creatorUser.uid),
  );

  log(
    '%s: sending aggregation email to %s members',
    agendaEvent.agendaUid,
    targetedMembers.length,
  );

  await mails.send({
    template: 'eventAggregation',
    to: targetedMembers.map((member) => {
      const lang = member.user.culture || 'fr';
      const eventTitle = event.title[lang] || _.find(event.title);

      return {
        address: member.user.email,
        lang: member.user.culture,
        unsubscriptions: [
          {
            rule: ['receive', 'eventAggregation'],
            dataPath: 'unsubscribeLink',
          },
          {
            memberId: member.id,
            rule: ['receive', 'eventAggregation'],
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
      sourceAgenda: sourceAgenda.title,
    },
  });
  log('done');
};
