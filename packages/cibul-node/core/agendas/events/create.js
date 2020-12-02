'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');

const log = require('@openagenda/logs')('core/agendas/events/create');
const {
  toEventServiceFormat
} = require('@openagenda/agenda-contribute/server/parse');

const createPayload = require('../utils/createPayload');
const doAdd = require('../utils/doAdd');
const processOEmbed = require('../utils/processOEmbed');
const ValidationError = require('../../utils/ValidationError');

const {
  loadAgenda,
  cleanEvent
} = require('../utils/loadAgendaAndCleanEvent');

const determineEventState = require('../utils/determineEventState');

module.exports = async (services, agendaUid, data, options = {}) => {
  log('info', 'processing', { agendaUid, options });

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

  const clean = await cleanEvent(services, agenda, data, {
    draft,
    defaultLang,
    formSchemaDataFormat,
    member,
    access,
    state: determineEventState(data, {
      access,
      defaultState: agenda?.settings?.contribution?.defaultState
    })
  });

  const payload = createPayload(services, agenda);

  try {
    clean.event.links = await processOEmbed(services.oembed, clean.event.longDescription, clean.event.links);
    log('retrieved %s links', clean.event.links.length);
  } catch (e) {
    log('error', 'could not retrieve oembeds', e);
  }

  log('pre-validation done', { agendaUid });

  let result;

  const eventServiceDataFormat = {
    ...toEventServiceFormat(clean.event, { raw: data }),
    ..._extractOwnerAndCreator(data, contextUserUid),
    agendaUid // at create, current agenda is origin agenda
  };

  try {
    // create the event
    result = await events.create(eventServiceDataFormat, {
      context: {
        userUid: contextUserUid
      },
      detailed: true,
      internal: true,
      transferToLegacy: !draft,
      draft
    });
  } catch (e) {
    log('error', 'failed to create event', {
      agendaUid: agenda.uid,
      eventServiceDataFormat
    });
    throw e;
  }

  if (!result.valid) {
    throw new ValidationError(result.errors);
  } else {;
    payload.setItem('event', result.event);
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
