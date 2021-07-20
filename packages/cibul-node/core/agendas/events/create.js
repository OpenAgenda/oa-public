'use strict';

const ih = require('immutability-helper');

const log = require('@openagenda/logs')('core/agendas/events/create');

const createPayload = require('../utils/createPayload');
const doAdd = require('../utils/doAdd');
const extractUserUid = require('../utils/extractUserUid');
const loadAuthorizations = require('../../utils/authorizations');
const processOEmbed = require('../utils/processOEmbed');
const ValidationError = require('../../utils/ValidationError');
const UnauthorizedError = require('../../utils/UnauthorizedError');

const cleanEvent = require('../utils/cleanEvent');

const getAgenda = require('../utils/getAgenda');

const assignState = require('../utils/assignState');

module.exports = async (core, agendaUid, data, options = {}) => {
  log('info', 'creating event on agenda %s', agendaUid);

  const {
    services
  } = core;

  const {
    members,
    events
  } = services;

  const {
    access,
    draft,
    defaultLang,
    formSchemaDataFormat,
    filterUnauthorizedData,
    returnPayload,
  } = {
    access: 'public', // read or write?
    draft: false,
    defaultLang: 'en',
    formSchemaDataFormat: false,
    filterUnauthorizedData: false,
    returnPayload: false,
    ...options
  };

  const userUid = extractUserUid(data, options);

  const member = userUid ? await members.get({ agendaUid, userUid }) : null;

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });
  log('  loaded agenda %s', agenda.slug);

  const clean = await cleanEvent(services, agenda, data, {
    draft,
    defaultLang,
    filterUnauthorizedData,
    formSchemaDataFormat,
    member,
    access
  });

  log('  cleaned data');

  const authorizations = await loadAuthorizations(core, 'create', {
    agenda,
    member,
    access
  });

  if (!authorizations.canCreateEvent) {
    throw new UnauthorizedError('event', null, 'not authorized to create event');
  }

  assignState(agenda, null, clean, data, {
    authorizations,
    draft
  });
  log('  associated state');

  const payload = createPayload(services, agenda);

  try {
    clean.event.links = await processOEmbed(services.oembed, clean.event.longDescription, clean.event.links);
    log('  retrieved %s links', clean.event.links.length);
  } catch (e) {
    log('error', '  could not retrieve oembeds', e);
  }

  log('  pre-validation done', { agendaUid });

  try {
    const event = await events.create(clean.event, {
      context: {
        userUid,
        agendaUid
      },
      detailed: true,
      access: 'internal',
      draft
    });

    payload.setItem('event', event);

    log('created event', event.uid);
  } catch (e) {
    if (e.toString() === 'ValidationError: Invalid data') {
      log('info', 'invalid data', e);
      throw new ValidationError(e.detail);
    }
    log('error', 'failed to create event', {
      agendaUid: agenda.uid,
      event: clean.event
    });
    throw e;
  }

  const response = await doAdd(core, payload, ih(clean, {
    agendaEvent: {
      canEdit: { $set: true }
    },
    // required for custom legacy sync only.
    agendaId: { $set: agenda.id }
  }), {
    draft,
    userUid,
    access
  });

  return returnPayload ? response : response.event;
};
