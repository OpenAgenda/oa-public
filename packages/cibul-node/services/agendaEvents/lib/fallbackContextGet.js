'use strict';

const _ = require('lodash');
const log = require('@openagenda/logs')('agendaEvents/fallbackContextGet');

module.exports = async ({ services }, interfaceName, ref, context) => {
  const {
    users,
    events: eventsSvc,
    agendas: agendasSvc,
  } = services;

  let event = _.get(context, 'event');
  let agenda = _.get(context, 'agenda');
  let user = _.get(context, 'user');

  if (!event) {
    log('warn', 'event is missing in context', ref);

    event = await eventsSvc.get({ uid: ref.eventUid }, {
      private: null,
      deleted: null,
      access: 'internal',
      detailed: true,
    });

    if (!event) log('error', 'event of uid %s could not be retrieved', _.get(ref, 'uid'), ref);
  } else {
    log('event %s, %s is in context', event.uid, event.slug);
  }

  if (!agenda) {
    log('warn', 'agenda is missing in context', ref);

    agenda = await agendasSvc.get({ uid: ref.agendaUid }, {
      internal: true,
      private: null,
      includeImagePath: true,
    });
  } else {
    log('agenda %s, %s is in context', agenda.uid, agenda.slug);
  }

  if (user) {
    log('user is in context');
  }

  if (!user && context.userUid) {
    log('user is not in context, but userUid is');
    user = await users.findOne({ query: { uid: context.userUid } });
  }

  if (!user) {
    try {
      log('warn', 'user is missing in context', ref);

      user = await users.findOne({ query: { uid: context.userUid } });
    } catch (e) {
      log('error', 'could not load user');
    }
  }

  return { agenda, event, user };
};
