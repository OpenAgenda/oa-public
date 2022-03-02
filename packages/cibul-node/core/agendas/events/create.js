'use strict';

const ih = require('immutability-helper');

const log = require('@openagenda/logs')('core/agendas/events/create');
const { BadRequest, Forbidden } = require('@openagenda/verror');

const createPayload = require('../utils/createPayload');
const doAdd = require('../utils/doAdd');
const extractUserUid = require('../utils/extractUserUid');
const loadAuthorizations = require('../../utils/authorizations');
const processOEmbed = require('../utils/processOEmbed');

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
    filterUnauthorizedData,
    returnPayload,
    fileKey
  } = {
    access: 'public', // read or write?
    draft: false,
    defaultLang: 'en',
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
    throw new Forbidden('not authorized to create event');
  }

  assignState(agenda, null, clean, data, {
    authorizations,
    draft
  });
  log('  associated state');

  const payload = createPayload(services, agenda);

  try {
    clean.event.links = await processOEmbed(services.oembed, clean.event.longDescription, {
      current: clean.event.links,
      includeEmbedlessLinks: true,
      filterInvalidLinks: true
    });
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
      private: !!agenda.private,
      draft,
      fileKey
    });

    payload.setItem('event', event);

    log('created event', event.uid);
  } catch (e) {
    if (e.toString() === 'ValidationError: Invalid data') {
      log('info', 'invalid data', e);
      throw new BadRequest({
        info: e.detail
      }, 'invalid data');
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
