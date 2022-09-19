'use strict';

const log = require('@openagenda/logs')('core/users/getEventUserContext');

const {
  NotFound
} = require('@openagenda/verror');

const {
  getForUserOnAgenda: getUserAuthorizationsOnAgenda
} = require('../utils/authorizations');

const validateOptions = require('./lib/validateEventContextOptions');

module.exports = async (core, identifier, agendaUid, eventOrUid, options = {}) => {
  const {
    agendaEvents,
    events,
  } = core.services;

  const eventUid = eventOrUid?.constructor.name === 'Object' ? eventOrUid.uid : eventOrUid;

  const {
    includes
  } = validateOptions(options);

  const ae = await agendaEvents(agendaUid).get(eventUid);

  const event = await eventOrUid?.constructor.name === 'Object' ? eventOrUid : await events.get(eventOrUid, {
    private: null,
    access: 'internal',
    includeFields: ['uid', 'private', 'ownerUid', 'draft']
  });

  if (!ae && !event.draft) {
    throw new NotFound('event reference not found');
  }

  const response = { me: {} };

  if (includes.includes('me.authorizations')) {
    response.me.authorizations = await getUserAuthorizationsOnAgenda(core, identifier, agendaUid, event, {
      agendaEvent: ae
    });
  }

  if (includes.includes('me.member')) {
    response.me.member = await core.agendas(agendaUid).members.get(identifier, {
      ...options,
      throwOnNotFound: false
    });
  }

  if (includes.includes('member')) {
    try {
      response.member = ae?.userUid ? await core.agendas(agendaUid).members.get(ae.userUid, options) : null;
    } catch (e) {
      if (e.name === 'Forbidden') {
        log('event member data is not accessible to requesting user');
      } else {
        log('warn', e);
      }
    }
  }

  return response;
};
