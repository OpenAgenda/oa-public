'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('services/agendaEvents/sendEventUpdate');

const agendaLogo = require('./utils/agendaLogo');
const eventLink = require('./utils/eventLink');
const listAdminMods = require('./utils/listAdminMods');
const getStateSlug = require('./utils/getStateSlug');

module.exports = async ({ config, services }, {
  agendaEvent, context, agenda, event,
}) => {
  const {
    root,
  } = config;

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
  if (_.get(context, 'batched')) {
    log('part of batch, not sending event update emails');
    return;
  }

  const stateLabel = getStateSlug(agendaEvent);

  const link = eventLink(root, agenda, event);

  const logo = agendaLogo(agenda);

  const members = await listAdminMods(membersSvc, agenda.uid);

  if (!event.creatorUid) {
    log('warn', 'creatorUid is missing, cannot send emails');
    return;
  }

  const creatorUser = await usersSvc.findOne({
    query: { uid: event.creatorUid },
  });

  const creator = await membersSvc.get({
    agendaUid: agenda.uid,
    userUid: creatorUser.uid,
  });

  const creatorLang = creatorUser.culture || 'fr';

  if (!creator) {
    log('creator member was not found for user of uid % in agenda %s', event.creatorUid, agenda.slug);
  } else if (agendaEvent.agendaUid === event.agendaUid) {
    log('agenda is origin agenda and user is creator, sending myEventUpdate');
    await mails.send({
      template: 'myEventUpdate',
      to: {
        address: creatorUser.email,
        unsubscriptions: [{
          rule: ['receive', 'myEventUpdate'],
          dataPath: 'unsubscribeLink',
        }, {
          memberId: creator.id,
          rule: ['receive', 'myEventUpdate'],
          dataPath: 'memberUnsubscribeLink',
        }],
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

  await mails.send({
    template: 'eventUpdate',
    to: members
      .filter(member => !!member.user)
      .filter(member => !creator || (member.id !== creator.id))
      .map(member => {
        const lang = member.user.culture || 'fr';
        const eventTitle = event.title[lang] || _.find(event.title);

        return {
          address: member.user.email,
          lang: member.user.culture,
          unsubscriptions: [{
            rule: ['receive', 'eventUpdate'],
            dataPath: 'unsubscribeLink',
          }, {
            memberId: member.id,
            rule: ['receive', 'eventUpdate'],
            dataPath: 'memberUnsubscribeLink',
          }],
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
