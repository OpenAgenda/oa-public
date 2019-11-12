'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const VError = require('verror');

const log = require('@openagenda/logs')('core/agendas/events/create');
const {
  toEventServiceFormat
} = require('@openagenda/agenda-contribute/server/parse');

const createPayload = require('../utils/createPayload');
const doAdd = require('../utils/doAdd');
const processOEmbed = require('../utils/processOEmbed');
const loadAgendaAndCleanEvent = require('../utils/loadAgendaAndCleanEvent');


module.exports = async (services, agendaUid, data, options = {}) => {
  log('info', 'processing', { agendaUid, options });

  const {
    events,
    agendas,
    formSchemas,
    eventSearch
  } = services;

  const contextUserUid = _.get( options, 'context.userUid', _.get( data, 'creatorUid' ) );

  const {
    draft,
    formSchemaDataFormat,
    defaultLang
  } = Object.assign({
    draft: false,
    formSchemaDataFormat: false,
    defaultLang: 'en'
  }, options || {});

  const {
    clean,
    agenda
  } = await loadAgendaAndCleanEvent(services, agendaUid, data, {
    draft,
    formSchemaDataFormat
  });

  const payload = createPayload(services, agenda, 'created');

  try {
    clean.event.links = await processOEmbed(clean.event.longDescription, clean.event.links);
    log('retrieved %s links', clean.event.links.length);
  } catch (e) {
    log('error', 'could not retrieve oembeds', e);
  }

  log('pre-validation done', { agendaUid });

  let result;

  const eventServiceDataFormat = {
    ...toEventServiceFormat(clean.event, null, { raw: data }),
    ..._.pick(data, ['ownerUid', 'creatorUid']),
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
    throw new VError({
      name: 'validationError',
      info: {
        errors: result.errors
      }
    });
  } else {
    payload.setItem('event', null, result.event);
  }

  await doAdd(services, payload, ih(clean, {
    agendaEvent: {
      canEdit: { $set: true }
    },
    // required for custom legacy sync only.
    agendaId: { $set: agenda.id }
  }), {
    draft,
    userUid: contextUserUid
  });

  // same for draft or not
  return payload.getResponse();
}
