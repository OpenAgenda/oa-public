'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const ValidationError = require('../../utils/ValidationError');

const log = require('@openagenda/logs')('core/agendas/events/update');

const legacy = require('../../../services/legacy');
const legacyEventSearch = require('../../../services/elasticsearch');
const processOEmbed = require('../utils/processOEmbed');

const createPayload = require('../utils/createPayload');
const refreshAgenda = require('../utils/refreshAgenda');
const setCustom = require('../utils/setCustom');
const merge = require('../utils/merge');

const {
  loadAgenda,
  cleanEvent
} = require('../utils/loadAgendaAndCleanEvent');

const assignState = require('../utils/assignState');

async function update(services, agendaUid, eventUid, data, options = {}) {
  log('info', 'updating event %s on agenda %s', eventUid, agendaUid);

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
    defaultLang,
    batched,
    access,
    returnPayload
  } = {
    draft: false,
    partial: false,
    defaultLang: 'en',
    batched: false,
    access: 'public',
    returnPayload: false,
    ...options
  };

  const agenda = await loadAgenda(services, agendaUid);
  log('  loaded agenda %s', agenda?.slug);

  const event = await events.get(eventUid, {
    access: 'internal',
    detailed: true,
    throwOnNotFound: true
  });
  log('  loaded event %s', event.slug);

  const clean = await cleanEvent(services, agenda, data, {
    draft,
    optionalSecondaryFields: true,
    partial,
    access,
    defaultLang
  });

  assignState(agenda, event, clean, data, {
    access,
    draft
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

  try {
    payload.setItem('event', await events[partial ? 'patch' : 'update'](eventUid, clean.event, {
      context: {
        agendaUid,
        userUid: contextUserUid,
        updateSearchIndex: false
      },
      detailed: true,
      access: 'internal',
      draft
    }));

    log('updated event %s', event.uid);
  } catch (e) {
    if (e.toString() === 'ValidationError: Invalid data') {
      log('info', 'invalid data', e);
      throw new ValidationError(e.detail);
    }
    log('error', 'failed to update event', {
      agendaUid: agenda.uid,
      eventUid,
      error: e
    });
    throw e;
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
      log('updated agenda custom data %s.%s', agenda.formSchemaId, eventUid);
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
      log('updated network custom data %s.%s', agenda.network.formSchemaId, eventUid);
      payload.setItem('custom.network', result.before, result.custom);
    }
  }

  if (draft) {
    const response = await payload.getResponse('updated', access);
    log('sending response for draft update');
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
      log('updated agendaEvent reference %s.%s', agendaUid, eventUid);
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
      ]);
      log('set legacy tag & custom values');
    } catch (e) {
      log('error', 'failed to set legacy tags and custom data', e);
    }
  }

  try {
    await legacyEventSearch.updateEvent({ uid: eventUid });
    log('updated legacy ES index for event %s', eventUid);
  } catch (e) {
    log('error', 'could not update legacy search for event %s', eventUid, e);
  }

  const response = await payload.getResponse('event', access);

  try {
    await eventSearch.update(response);
    log('updated search for event %s', eventUid);
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


