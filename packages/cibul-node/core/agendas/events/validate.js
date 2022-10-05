'use strict';

const log = require('@openagenda/logs')('core/agendas/events/validate');
const extractUserUid = require('../utils/extractUserUid');
const cleanEvent = require('../utils/cleanEvent');

const getAgenda = require('../utils/getAgenda');

module.exports = async (core, agendaUid, data, options = {}) => {
  log('info', 'validating event on agenda %s', agendaUid);

  const {
    services,
  } = core;

  const {
    members,
  } = services;

  const {
    access,
    draft,
    defaultLang,
    filterUnauthorizedData,
  } = {
    access: 'public', // read or write?
    draft: false,
    defaultLang: 'en',
    filterUnauthorizedData: false,
    returnPayload: false,
    ...options,
  };

  const userUid = extractUserUid(data, options);

  const member = userUid ? await members.get({ agendaUid, userUid }) : null;

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });
  log('  loaded agenda %s', agenda.slug);

  return cleanEvent(services, agenda, data, {
    draft,
    defaultLang,
    filterUnauthorizedData,
    member,
    access,
  });
};

module.exports.eventFields = cleanEvent.eventFields;
