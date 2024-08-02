import _ from 'lodash';
import { fromMarkdownToHTML } from '@openagenda/md';
import agendaEventStates from '@openagenda/agenda-events/iso/states.js';
import logs from '@openagenda/logs';
import agendaLogo from './utils/agendaLogo.js';
import eventLink from './utils/eventLink.js';
import getStateSlug from './utils/getStateSlug.js';

const log = logs('services/agendaEvents/sendEventChangeState');

async function sendToContributor({
  services,
  contributor,
  contributorUser,
  agendaEvent,
  agenda,
  event,
  logo,
  link,
  beforeStateLabel,
  afterStateLabel,
}) {
  const { mails } = services;

  const conributorLang = contributorUser.culture || 'fr';

  const sendAgendaPublicationMessage = agendaEvent.state === agendaEventStates.PUBLISHED
    && _.get(agenda, 'settings.contribution.messages.publication');

  const to = {
    address: contributorUser.email,
    unsubscriptions: [
      {
        rule: ['receive', 'myEventChangeState'],
        dataPath: 'unsubscribeLink',
      },
      {
        memberId: contributor.id,
        rule: ['receive', 'myEventChangeState'],
        dataPath: 'memberUnsubscribeLink',
      },
    ],
  };

  const eventTitle = event.title[conributorLang] || _.find(event.title);

  const agendaTitle = agenda.title;

  if (sendAgendaPublicationMessage) {
    log('sending custom event publish notification to contributor');
    await mails.send({
      template: 'eventPublishContributor',
      to,
      data: {
        eventTitle,
        agendaTitle,
        logo,
        link,
        message: fromMarkdownToHTML(
          _.get(agenda, 'settings.contribution.messages.publication'),
        ),
      },
      lang: conributorLang,
    });
  } else {
    log('sending standard event publish notification message to contributor', {
      beforeState: beforeStateLabel,
      afterState: afterStateLabel,
    });
    await mails.send({
      template: 'myEventChangeState',
      to,
      data: {
        event: eventTitle,
        agenda: agendaTitle,
        beforeState: beforeStateLabel,
        afterState: afterStateLabel,
        logo,
        link,
      },
      lang: conributorLang,
    });
  }
}

export default async (
  { config, services },
  { agendaEvent, before, context, agenda, event },
) => {
  const { root } = config;

  const { mails, members: membersSvc, users: usersSvc } = services;

  if (!mails) {
    log('warn', 'mails is not initialized');
    return;
  }

  log('processing');
  const afterStateLabel = getStateSlug(agendaEvent);
  const beforeStateLabel = getStateSlug(before);

  const link = eventLink(root, agenda, event);
  const logo = agendaLogo(agenda);

  const members = await membersSvc.utils.listAllAdminMods(agenda.uid);

  log('Found %s adminmods', members.length);

  const contributorUser = agendaEvent.userUid
    ? await usersSvc.findOne({
      query: { uid: agendaEvent.userUid },
    })
    : null;

  log(
    '%s contributor user%s',
    contributorUser ? 'Found' : 'Did not find',
    contributorUser ? ` ${contributorUser.uid}` : '',
  );

  const contributor = contributorUser
    ? await membersSvc.get({
      agendaUid: agenda.uid,
      userUid: contributorUser.uid,
    })
    : null;
  const creator = await membersSvc.get({
    agendaUid: event.agendaUid, // origin agenda
    userUid: event.creatorUid,
  });
  const creatorUser = await usersSvc.findOne({
    query: {
      uid: event.creatorUid,
    },
  });

  if (contributorUser) {
    log(
      '%s corresponding member%s',
      contributor ? 'Found' : 'Did not find',
      contributor ? ` (${contributor.id})` : '',
    );
  }

  const eventIsPublished = agendaEvent.state === agendaEventStates.PUBLISHED;
  const eventIsRefused = agendaEvent.state === agendaEventStates.REFUSED;

  if (eventIsPublished) log('event is published');
  if (eventIsRefused) log('event is refused');

  const creatorIsAdminmod = creatorUser
    && members.includes(
      member => member.user && member.user.uid !== creatorUser.uid,
    );
  const visibleForCreator = creatorIsAdminmod || (!agenda.private && eventIsPublished);

  if (visibleForCreator) log('creator should see change');

  const contributorIsAdminmod = contributor?.role
    && membersSvc.utils.compareRoles.isSuperiorToOrEqual(
      contributor.role,
      'moderator',
    );

  let sentToCreator = false;
  let sentToContributor = false;

  if (
    creatorUser
    && creatorUser.uid !== contributorUser?.uid
    && visibleForCreator
  ) {
    log('creator is not contributor, notifying creator');
    await sendToContributor({
      services,
      contributor: creator,
      contributorUser: creatorUser,
      agendaEvent,
      agenda,
      event,
      logo,
      link,
      beforeStateLabel,
      afterStateLabel,
    });

    sentToCreator = true;
  }

  if (
    contributorUser
    && (contributorIsAdminmod || eventIsPublished || eventIsRefused)
  ) {
    log('notifying contributor');
    await sendToContributor({
      services,
      contributor,
      contributorUser,
      agendaEvent,
      agenda,
      event,
      logo,
      link,
      beforeStateLabel,
      afterStateLabel,
    });

    sentToContributor = true;
  }

  if (_.get(context, 'batched')) {
    log('part of batch, not sending change state email');
    return;
  }

  await mails.send({
    template: 'eventChangeState',
    to: members
      .filter(member => {
        if (!member.user) {
          log('warn', 'no user was found matching member %s', member.id);
        }

        return !!member.user;
      })
      .filter(member => {
        if (sentToCreator && member.user.uid === creatorUser.uid) {
          // if notification was sent to creator and creator is member, should not receive eventChangeState.
          return false;
        }
        if (sentToContributor && member.user.uid === contributorUser?.uid) {
          // if notification was sent to contributor and is adminmod member, should not receive eventChangeState.
          return false;
        }
        return true;
      })
      .map(member => {
        log('sending to member %s', member.id);
        const lang = member.user.culture || 'fr';
        const eventTitle = event.title[lang] || _.find(event.title);

        return {
          address: member.user.email,
          lang: member.user.culture,
          unsubscriptions: [
            {
              rule: [
                'receive',
                'eventChangeState',
                { state: agendaEvent.state },
              ],
              dataPath: 'unsubscribeLink',
            },
            {
              memberId: member.id,
              rule: [
                'receive',
                'eventChangeState',
                { state: agendaEvent.state },
              ],
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
      beforeState: beforeStateLabel,
      afterState: afterStateLabel,
      logo,
      link,
    },
  });
  log('done');
};
