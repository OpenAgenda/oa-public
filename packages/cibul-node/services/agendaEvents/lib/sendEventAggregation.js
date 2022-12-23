'use strict';

const _ = require('lodash');
const agendaEventStates = require('@openagenda/agenda-events/iso/states');
const log = require('@openagenda/logs')('agendaEvents/sendEventAggregation');

const agendaLogo = require('./utils/agendaLogo');
const eventLink = require('./utils/eventLink');
const listAdminMods = require('./utils/listAdminMods');
const getStateSlug = require('./utils/getStateSlug');

module.exports = async ({ config, services }, { agendaEvent, context }) => {
  const {
    root,
  } = config;

  const {
    agendas,
    users: usersSvc,
    mails,
    members: membersSvc,
  } = services;

  log('processing');
  const { sourceAgenda, agenda, event } = context;
  const link = eventLink(root, agenda, event);

  const stateLabel = getStateSlug(agendaEvent);

  const logo = agendaLogo(agenda);

  const members = await listAdminMods(membersSvc, agenda.uid);

  const originAgenda = await agendas.get({
    uid: event.agendaUid,
  }, { private: null, internal: true, includeImagePath: true });
  const creatorUser = await usersSvc.findOne({ query: { uid: event.creatorUid } });
  const creator = await membersSvc.get({
    agendaUid: originAgenda.uid,
    userUid: creatorUser.uid,
  });
  const creatorLang = creatorUser.culture || 'fr';
  const creatorIsInDestination = members.indexOf(member => member.user && member.user.uid !== creatorUser.uid) !== -1;
  const visibleForCreator = creatorIsInDestination
    || (!agenda.private && agendaEvent.state === agendaEventStates.PUBLISHED);

  if (visibleForCreator) {
    await mails.send({
      template: 'myEventAggregation',
      to: {
        address: creatorUser.email,
        unsubscriptions: [
          {
            rule: ['receive', 'myEventAggregation'],
            dataPath: 'unsubscribeLink',
          }, {
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

  const targetedMembers = members.filter(member =>
    member.user
    && !(
      member.user.uid === creatorUser.uid && visibleForCreator
    ));

  log('sending aggregation email to %s members', targetedMembers.length);

  await mails.send({
    template: 'eventAggregation',
    to: targetedMembers.map(member => {
      const lang = member.user.culture || 'fr';
      const eventTitle = event.title[lang] || _.find(event.title);

      return {
        address: member.user.email,
        lang: member.user.culture,
        unsubscriptions: [
          {
            rule: ['receive', 'eventAggregation'],
            dataPath: 'unsubscribeLink',
          }, {
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
