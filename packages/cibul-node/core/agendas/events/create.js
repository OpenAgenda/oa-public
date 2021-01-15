'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');

const log = require('@openagenda/logs')('core/agendas/events/create');

const createPayload = require('../utils/createPayload');
const doAdd = require('../utils/doAdd');
const processOEmbed = require('../utils/processOEmbed');
const ValidationError = require('../../utils/ValidationError');

const {
  loadAgenda,
  cleanEvent
} = require('../utils/loadAgendaAndCleanEvent');

const assignState = require('../utils/assignState');

module.exports = async (services, agendaUid, data, options = {}) => {
  log('info', 'creating event on agenda %s', agendaUid);

  const {
    members,
    events,
    agendas,
    formSchemas,
    eventSearch
  } = services;

  const {
    access,
    context,
    draft,
    defaultLang,
    formSchemaDataFormat,
    returnPayload,
  } = {
    access: 'public', // read or write?
    context: {},
    draft: false,
    defaultLang: 'en',
    formSchemaDataFormat: false,
    returnPayload: false,
    ...options
  }

  const contextUserUid = context.userUid || data.creatorUid;

  const member = await members.get({
    agendaUid,
    userUid: contextUserUid
  });

  const agenda = await loadAgenda(services, agendaUid);
  log('  loaded agenda %s', agenda.slug);

  const clean = await cleanEvent(services, agenda, data, {
    draft,
    defaultLang,
    formSchemaDataFormat,
    member,
    access
  });
  log('  cleaned data');

  assignState(agenda, null, clean, data, {
    access,
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

  let result;

  try {
    const event = await events.create(clean.event, {
      context: {
        userUid: contextUserUid,
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

  const response = await doAdd(services, payload, ih(clean, {
    agendaEvent: {
      canEdit: { $set: true }
    },
    // required for custom legacy sync only.
    agendaId: { $set: agenda.id }
  }), {
    draft,
    userUid: contextUserUid,
    access
  });

  return returnPayload ? response : response.event;
}

function _extractOwnerAndCreator(data, contextUserUid) {
  const extracted = {
    ownerUid: null,
    creatorUid: null
  };

  if (data.ownerUid) {
    extracted.ownerUid = data.ownerUid;
  } else if (contextUserUid) {
    extracted.ownerUid = contextUserUid;
  }

  if (data.creatorUid) {
    extracted.creatorUid = data.creatorUid;
  } else {
    extracted.creatorUid = extracted.ownerUid;
  }

  return extracted;
}
