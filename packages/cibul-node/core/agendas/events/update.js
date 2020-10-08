'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const ValidationError = require('../../utils/ValidationError');

const log = require('@openagenda/logs')('core/agendas/events/update');

const {
  toEventServiceFormat
} = require('@openagenda/agenda-contribute/server/parse');

const legacy = require('../../../services/legacy');
const legacyEventSearch = require('../../../services/elasticsearch');
const processOEmbed = require('../utils/processOEmbed');

const createPayload = require('../utils/createPayload');
const refreshAgenda = require('../utils/refreshAgenda');
const setCustom = require('../utils/setCustom');
const merge = require('../utils/merge');
const loadAgendaAndCleanEvent = require('../utils/loadAgendaAndCleanEvent');

async function update(services, agendaUid, eventUid, data, options = {}) {
  log('processing', { agendaUid, eventUid, options });

  const {
    events,
    agendas,
    agendaEvents,
    eventSearch,
    oembed,
    aggregators,
    custom
  } = services;

  const contextUserUid = _.get(options, 'context.userUid') || _.get(data, 'creatorUid');

  const {
    draft,
    partial,
    formSchemaDataFormat,
    defaultLang,
    batched,
    access,
    returnPayload
  } = {
    draft: false,
    partial: false,
    formSchemaDataFormat: false,
    defaultLang: 'en',
    batched: false,
    access: 'public',
    returnPayload: false,
    ...options
  };

  const {
    clean,
    agenda
  } = await loadAgendaAndCleanEvent(services, agendaUid, data, {
    draft,
    formSchemaDataFormat,
    optionalSecondaryFields: true,
    partial,
    access,
    defaultLang
  });

  const payload = createPayload(services, agenda);

  if (clean.event.longDescription) {
    try {
      clean.event.links = await processOEmbed(oembed, clean.event.longDescription, clean.event.links);
      log('retrieved %s links', clean.event.links.length);
    } catch (e) {
      log('error', 'could not retrieve oembeds', e);
    }
  }

  let result;

  const eventServiceDataFormat = toEventServiceFormat(clean.event, {
    raw: data,
    partial
  });

  try {
    result = await events.update({ uid: eventUid }, eventServiceDataFormat, {
      context: {
        agendaUid,
        userUid: contextUserUid,
        updateSearchIndex: false
      },
      detailed: true,
      internal: true,
      transferToLegacy: !draft,
      draft
    });
  } catch (e) {
    log('error', 'failed to update event', {
      agendaUid: agenda.uid,
      eventUid,
      eventServiceDataFormat,
      error: e
    });
    throw e;
  }

  if (!result.valid) {
    log('error', 'update was not successful', result);
    throw new ValidationError(result.errors);
  } else {
    payload.setItem('event', result.before, result.event);
  }

  if (agenda.formSchemaId && clean.custom) {
    const result = await setCustom(
      custom,
      agenda.formSchemaId,
      payload.getItem('event.uid'),
      clean.custom, {
        draft,
        agendaId: agenda.id,
        access
      }
    );
    if (result.success) {
      payload.setItem('custom.agenda', result.before, result.custom);
    }
  }

  if (agenda.network && clean.networkCustom) {
    const result = await setCustom(
      custom,
      agenda.network.formSchemaId,
      payload.getItem('event.uid'),
      clean.networkCustom, {
        agendaId: agenda.id,
        access
      }
    );

    if (result.success) {
      payload.setItem('custom.network', result.before, result.custom);
    }
  }

  if (draft) {
    const response = await payload.getResponse('updated', access);
    return returnPayload ? response : response.updated;
  }

  // event is not draft (anymore)

  if (clean.agendaEvent) {
    try {
      result = await agendaEvents(agendaUid).set(payload.getItem('event.uid'), ih(clean.agendaEvent, {
        create: {
          $set: { canEdit: true }
        }
      }), {
        transferToLegacy: true,
        context: {
          aggregated: false,
          legacy: false,
          userUid: contextUserUid,
          event: payload.getItem('event'),
          agenda,
          batched
        },
        decorate: ['member']
      });
    } catch(e) {
      log('error', 'failed to update agendaEvent ref', e);
      throw e;
    }

    payload.setItem('agendaEvent', result.before, result.set);
  }

  if (!draft) {
    try {
      await legacy.tagsAndCustom.set(agenda.id, payload.getItem('event.uid'), [
        agenda.formSchema,
        _.get(agenda, 'network.formSchema')
      ], [
        partial && agenda.formSchemaId ? await custom(agenda.formSchemaId).get(eventUid) : clean.custom,
        partial && agenda.network && agenda.network.formSchemaId ? await custom(agenda.network.formSchemaId).get(eventUid) : clean.networkCustom
      ] );
    } catch (e) {
      log('error', 'failed to set legacy tags and custom data', e);
    }
  }

  try {
    await legacyEventSearch.updateEvent({ uid: eventUid });
  } catch (e) {
    log('error', 'could not update legacy search for event %s', eventUid, e);
  }

  const response = await payload.getResponse('event', access);

  try {
    await eventSearch.update(response);
  } catch (e) {
    log('error', 'could not update search indices for event %s.%s: %s', agenda.uid, eventUid, e);
  }

  await aggregators.notify('updateEvent', {
    event: await payload.getCompiledEvent(),
    before: await payload.getCompiledEvent('before'),
    agenda,
    formSchema: payload.getFormSchema(),
    batched
  });

  await refreshAgenda(agenda.uid);

  return returnPayload ? response : response.event;
}

function patch(services, agendaUid, eventUid, data, options = {}) {
  return update(services, agendaUid, eventUid, data, {
    ...options,
    partial: true
  });
}

module.exports = Object.assign(update, { patch });


