'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const log = require('@openagenda/logs')('core/agendas/events/update');
const { Forbidden } = require('@openagenda/verror');

const legacy = require('../../../services/legacy');
const legacyEventSearch = require('../../../services/elasticsearch');

const createPayload = require('../utils/createPayload');
const refreshAgenda = require('../utils/refreshAgenda');
const setCustom = require('../utils/setCustom');

const cleanEvent = require('../utils/cleanEvent');
const getAgenda = require('../utils/getAgenda');
const formatError = require('../utils/formatError');

const loadAuthorizations = require('../../utils/authorizations');

const { containsEventData } = cleanEvent;

const { filterUnauthorized } = loadAuthorizations;

const assignState = require('../utils/assignState');
const updateEvent = require('./lib/updateEvent');
const createUpdateActivity = require('./lib/createUpdateActivity');

const shouldHaveAgendaEvent = (operation, event) => (operation !== 'create') && !event.draft;

async function update(core, agendaUid, eventUid, data, options = {}) {
  const {
    events,
    agendaEvents,
    eventSearch,
    members,
    aggregators,
    custom,
  } = core.services;

  const actingUserUid = options.userUid ?? options.context?.userUid;
  log('info', 'update of event %s on agenda %s%s', eventUid, agendaUid, actingUserUid ? ` by user ${actingUserUid}` : ' (no acting user)');

  const {
    draft = false,
    partial = false,
    defaultLang = 'en',
    batched = false,
    aggregated = null,
    access = 'public',
    filterUnauthorizedData = false,
    returnPayload = false,
    private: privateOption = false,
  } = options;

  const agenda = await getAgenda(core.services, agendaUid, {
    detailed: true,
    includeMemberSchema: true,
  });

  log('  loaded agenda %s', agenda?.slug);

  const event = await events.get(eventUid, {
    access: 'internal',
    detailed: true,
    throwOnNotFound: true,
    private: privateOption,
  });

  log('  loaded event %s', event.slug);

  const agendaEvent = shouldHaveAgendaEvent('update', event) ? await agendaEvents(agenda.uid).get(event.uid, { throwOnNotFound: true }) : null;

  const actingMember = actingUserUid ? await members.get({
    agendaUid: agenda.uid,
    userUid: actingUserUid,
  }, { roleAsSlug: false }) : null;

  const clean = await cleanEvent(core.services, agenda, data, {
    validateWithStoredData: !!partial,
    event, // required to validate related fields in case of partial update
    draft,
    optionalSecondaryFields: true,
    partial,
    access,
    member: actingMember,
    defaultLang,
    aggregated,
  });

  const authorizations = await loadAuthorizations(core, 'update', {
    agenda,
    event,
    agendaEvent,
    member: actingMember,
    access,
  });

  if (filterUnauthorizedData) {
    filterUnauthorized(clean, data, authorizations);
  }

  if (!authorizations.canEditEvent && containsEventData(data)) {
    throw new Forbidden({
      info: {
        uid: event.uid,
      },
    }, 'not authorized to edit event');
  }

  const {
    type: stateChangeType,
  } = assignState(agenda, event, clean, data, {
    authorizations,
    draft,
  });

  const payload = createPayload(core.services, agenda);

  if (containsEventData(data)) {
    await updateEvent(core.services, {
      clean,
      payload,
      draft,
      agendaUid,
      userUid: actingUserUid,
      eventUid,
      privateOption,
      event,
      partial,
    });
  } else {
    payload.setItem('event', event, event);
  }

  if (agenda.formSchemaId && clean.custom) {
    const result = await setCustom(
      custom,
      agenda.formSchemaId,
      eventUid,
      clean.custom,
      {
        draft,
        agendaId: agenda.id,
        access,
      },
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
      clean.networkCustom,
      {
        agendaId: agenda.id,
        access,
      },
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
          $set: { canEdit: true },
        },
      }), {
        transferToLegacy: true,
        aggregated,
        context: {
          aggregated,
          legacy: false,
          userUid: actingUserUid,
          event,
          agenda,
          stateChangeType,
          batched,
        },
        decorate: ['sourceAgendas', 'user'],
      });

      if (result.set.userUid) {
        log('user linked to agendaEvent reference %s.%s: %s', agendaUid, eventUid, result.set.userUid);
        result.set.member = await core.agendas(agenda).members.get(result.set.userUid, {
          access: 'internal',
          throwOnNotFound: false,
          roleAsSlug: false,
        });
      }

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
        _.get(agenda, 'network.formSchema'),
      ], [
        partial && agenda.formSchemaId ? await custom(agenda.formSchemaId).get(eventUid) : clean.custom,
        partial && agenda.network && agenda.network.formSchemaId ? await custom(agenda.network.formSchemaId).get(eventUid) : clean.networkCustom,
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
  const compiledEvent = await payload.getCompiledEvent();

  try {
    await eventSearch.update({
      ...response,
      event: compiledEvent,
    });
    log('updated search for event %s', eventUid);
  } catch (e) {
    log('error', 'could not update search indices for event %s.%s: %s', agenda.uid, eventUid, formatError(e));
  }

  const before = await payload.getCompiledEvent('before');

  const formSchema = payload.getFormSchema();

  try {
    await createUpdateActivity(core.services, before, compiledEvent, {
      userUid: actingUserUid,
      agenda,
      formSchema,
    });
  } catch (e) {
    log('error', 'failed to create activity', e);
  }

  await aggregators.notify('updateEvent', {
    event: compiledEvent,
    before,
    agenda,
    formSchema,
    batched,
  });

  await refreshAgenda(agenda.uid);

  return returnPayload ? response : response.event;
}

function patch(core, agendaUid, eventUid, data, options = {}) {
  return update(core, agendaUid, eventUid, data, {
    ...options,
    partial: true,
  });
}

module.exports = Object.assign(update, { patch });
