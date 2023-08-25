'use strict';

const _ = require('lodash');
const marked = require('marked');

const agendaEventStates = require('@openagenda/agenda-events/iso/states');
const log = require('@openagenda/logs')('agendaEvents/sendEventChangeState');

const agendaLogo = require('./utils/agendaLogo');
const eventLink = require('./utils/eventLink');
const getStateSlug = require('./utils/getStateSlug');

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
  const {
    mails,
  } = services;

  const conributorLang = contributorUser.culture || 'fr';

  const sendAgendaPublicationMessage = (
    agendaEvent.state === agendaEventStates.PUBLISHED
  ) && _.get(agenda, 'settings.contribution.messages.publication');

  const to = {
    address: contributorUser.email,
    unsubscriptions: [{
      rule: ['receive', 'myEventChangeState'],
      dataPath: 'unsubscribeLink',
    }, {
      memberId: contributor.id,
      rule: ['receive', 'myEventChangeState'],
      dataPath: 'memberUnsubscribeLink',
    }],
  };

  const eventTitle = event.title[conributorLang] || _.find(event.title);

  const agendaTitle = agenda.title;

  if (sendAgendaPublicationMessage) {
    await mails.send({
      template: 'eventPublishContributor',
      to,
      data: {
        eventTitle,
        agendaTitle,
        logo,
        link,
        message: marked(_.get(agenda, 'settings.contribution.messages.publication')),
      },
      lang: conributorLang,
    });
  } else {
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

module.exports = async ({ config, services }, { agendaEvent, before, context, agenda, event }) => {
  const { root } = config;

  const {
    mails,
    members: membersSvc,
    users: usersSvc,
  } = services;

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

  const contributorUser = await usersSvc.findOne({
    query: { uid: agendaEvent.userUid },
  });

  const contributor = contributorUser ? await membersSvc.get({
    agendaUid: agenda.uid,
    userUid: contributorUser.uid,
  }) : null;
  const creator = await membersSvc.get({
    agendaUid: event.agendaUid, // origin agenda
    userUid: event.creatorUid,
  });
  const creatorUser = await usersSvc.findOne({
    query: {
      uid: event.creatorUid,
    },
  });

  const eventIsPublished = agendaEvent.state === agendaEventStates.PUBLISHED;
  const eventIsRefused = agendaEvent.state === agendaEventStates.REFUSED;

  const creatorIsAdminmod = members.indexOf(member => member.user && member.user.uid !== creatorUser.uid) !== -1;
  const visibleForCreator = creatorIsAdminmod || (!agenda.private && eventIsPublished);

  const contributorIsAdminmod = contributor?.role
    && membersSvc.utils.compareRoles.isSuperiorToOrEqual(contributor.role, 'moderator');

  let sentToCreator = false;
  let sentToContributor = false;

  if (creatorUser.uid !== contributorUser?.uid && visibleForCreator) {
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

  if (contributorIsAdminmod || eventIsPublished || eventIsRefused) {
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
      .filter(member =>
        (sentToCreator && member.user.uid === creatorUser.uid)
        || (sentToContributor && member.user.uid === contributorUser.uid))
      .map(member => {
        const lang = member.user.culture || 'fr';
        const eventTitle = event.title[lang] || _.find(event.title);

        return {
          address: member.user.email,
          lang: member.user.culture,
          unsubscriptions: [{
            rule: ['receive', 'eventChangeState', { state: agendaEvent.state }],
            dataPath: 'unsubscribeLink',
          }, {
            memberId: member.id,
            rule: ['receive', 'eventChangeState', { state: agendaEvent.state }],
            dataPath: 'memberUnsubscribeLink',
          }],
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
