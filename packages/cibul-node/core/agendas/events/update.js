'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const log = require('@openagenda/logs')('core/agendas/events/update');
const ValidationError = require('../../utils/ValidationError');
const UnauthorizedError = require('../../utils/UnauthorizedError');

const legacy = require('../../../services/legacy');
const legacyEventSearch = require('../../../services/elasticsearch');
const processOEmbed = require('../utils/processOEmbed');

const createPayload = require('../utils/createPayload');
const refreshAgenda = require('../utils/refreshAgenda');
const extractUserUid = require('../utils/extractUserUid');
const setCustom = require('../utils/setCustom');

const cleanEvent = require('../utils/cleanEvent');

const getAgenda = require('../utils/getAgenda');

const loadAuthorizations = require('../../utils/authorizations');

const { containsEventData } = cleanEvent;

const { filterUnauthorized } = loadAuthorizations;

const assignState = require('../utils/assignState');

const shouldHaveAgendaEvent = (operation, event) => (operation !== 'create') && !event.draft;

async function update(core, agendaUid, eventUid, data, options = {}) {
  log('info', 'updating event %s on agenda %s', eventUid, agendaUid);

  const {
    events,
    agendaEvents,
    eventSearch,
    oembed,
    members,
    aggregators,
    custom
  } = core.services;

  const userUid = extractUserUid(data, options);

  const {
    draft,
    partial,
    defaultLang,
    batched,
    aggregated,
    access,
    filterUnauthorizedData,
    returnPayload
  } = {
    draft: false,
    partial: false,
    defaultLang: 'en',
    batched: false,
    aggregated: null,
    access: 'public',
    returnPayload: false,
    filterUnauthorizedData: false,
    ...options
  };

  const agenda = await getAgenda(core.services, agendaUid, { detailed: true });

  log('  loaded agenda %s', agenda?.slug);

  const event = await events.get(eventUid, {
    access: 'internal',
    detailed: true,
    throwOnNotFound: true
  });

  log('  loaded event %s', event.slug);

  const agendaEvent = shouldHaveAgendaEvent('update', event) ? await agendaEvents(agenda.uid).get(event.uid, { throwOnNotFound: true }) : null;

  const member = userUid ? await members.get({
    agendaUid: agenda.uid,
    userUid
  }) : null;

  const clean = await cleanEvent(core.services, agenda, data, {
    validateWithStoredData: !!partial,
    event, // required to validate related fields in case of partial update
    draft,
    optionalSecondaryFields: true,
    partial,
    access,
    member,
    defaultLang,
    aggregated
  });

  const authorizations = await loadAuthorizations(core, 'update', {
    agenda,
    event,
    agendaEvent,
    member,
    access
  });

  if (filterUnauthorizedData) {
    filterUnauthorized(clean, data, authorizations);
  }

  if (!authorizations.canEditEvent && containsEventData(data)) {
    throw new UnauthorizedError('event', event.uid, 'not authorized to edit event');
  }

  const {
    type: stateChangeType
  } = assignState(agenda, event, clean, data, {
    authorizations,
    draft
  });

  const payload = createPayload(core.services, agenda);

  if (containsEventData(data)) {
    if (clean.event.longDescription) {
      try {
        clean.event.links = await processOEmbed(oembed, clean.event.longDescription, clean.event.links);
        log('retrieved %s links', clean.event.links.length);
      } catch (e) {
        log('error', 'could not retrieve oembeds', e);
      }
    }

    try {
      payload.setItem('event', event, await events[partial ? 'patch' : 'update'](eventUid, clean.event, {
        context: {
          agendaUid,
          userUid,
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
  } else {
    payload.setItem('event', event, event);
  }

  if (agenda.formSchemaId && clean.custom) {
    const result = await setCustom(
      custom,
      agenda.formSchemaId,
      eventUid,
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
      eventUid,
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
      const result = await agendaEvents(agendaUid).set(eventUid, ih(clean.agendaEvent, {
        create: {
          $set: { canEdit: true }
        }
      }), {
        transferToLegacy: true,
        aggregated,
        context: {
          aggregated,
          legacy: false,
          userUid,
          event,
          agenda,
          stateChangeType,
          batched
        },
        decorate: ['member']
      });
      log('updated agendaEvent reference %s.%s', agendaUid, eventUid);
      payload.setItem('agendaEvent', result.before, result.set);
    } catch (e) {
      log('error', 'failed to update agendaEvent ref', e);
      throw e;
    }
  }

  if (!draft) {
    try {
      await legacy.tagsAndCustom.set(agenda.id, eventUid, [
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

  const before = await payload.getCompiledEvent('before');

  await aggregators.notify('updateEvent', {
    event: await payload.getCompiledEvent(),
    before,
    agenda,
    formSchema: payload.getFormSchema(),
    batched
  });

  await refreshAgenda(agenda.uid);

  return returnPayload ? response : response.event;
}

function patch(core, agendaUid, eventUid, data, options = {}) {
  return update(core, agendaUid, eventUid, data, {
    ...options,
    partial: true
  });
}

module.exports = Object.assign(update, { patch });
