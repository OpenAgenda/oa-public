'use strict';

const _ = require('lodash');
const ih = require('immutability-helper');
const VError = require('verror');

const log = require('@openagenda/logs')('core/agendas/events/update');
const {
  toEventServiceFormat
} = require('@openagenda/agenda-contribute/server/parse');

const aggregators = require('../../../services/aggregators').instance;
const legacy = require('../../../services/legacy');
const legacyEventSearch = require('../../../services/elasticsearch');
const processOEmbed = require('../utils/processOEmbed');
const createPayload = require('../utils/createPayload');
const setCustom = require('../utils/setCustom');
const merge = require('../utils/merge');
const loadAgendaAndCleanEvent = require('../utils/loadAgendaAndCleanEvent');

module.exports = async (services, agendaUid, eventUid, data, options = {}) => {
  log('processing', { agendaUid, eventUid, options });

  const {
    events,
    agendas,
    agendaEvents,
    eventSearch
  } = services;

  const contextUserUid = _.get(options, 'context.userUid') || _.get(data, 'creatorUid');

  const {
    draft,
    partial,
    formSchemaDataFormat,
    defaultLang,
    batched
  } = {
    draft: false,
    partial: false,
    formSchemaDataFormat: false,
    defaultLang: 'en',
    batched: false,
    ...options
  };

  const {
    clean,
    agenda
  } = await loadAgendaAndCleanEvent(services, agendaUid, data, {
    draft,
    formSchemaDataFormat,
    optionalSecondaryFields: true,
    partial
  });

  const payload = createPayload(services, agenda, 'updated');

  if (clean.event.longDescription) {
    try {
      clean.event.links = await processOEmbed( clean.event.longDescription, clean.event.links );
      log( 'retrieved %s links', clean.event.links.length );
    } catch ( e ) {
      log( 'error', 'could not retrieve oembeds', e );
    }
  }

  let result;

  const eventServiceDataFormat = toEventServiceFormat(clean.event, null, {
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
    } );
  } catch (e) {
    log( 'error', 'failed to update event', {
      agendaUid: agenda.uid,
      eventUid,
      eventServiceDataFormat,
      error: e
    } );
    throw e;
  }

  if (!result.valid) {
    log('error', 'update was not successful', result);
    throw new VError({
      name: 'validationError',
      info: {
        errors: result.errors
      }
    });
  } else {
    payload.setItem('event', result.before, result.event);
  }

  if (agenda.formSchemaId && clean.custom) {
    const result = await setCustom(
      agenda.formSchemaId,
      payload.getItem('event.uid'),
      clean.custom, {
        draft,
        agendaId: agenda.id,
        partial
      }
    );
    if (result.success) {
      payload.setItem('custom.agenda', result.before, result.custom);
    }
  }

  if (agenda.network && clean.networkCustom) {
    const result = await setCustom(
      agenda.network.formSchemaId,
      payload.getItem('event.uid'),
      clean.networkCustom, {
        agendaId: agenda.id,
        partial
      }
    );

    if (result.success) {
      payload.setItem('custom.network', result.before, result.custom);
    }
  }

  if (draft) {
    return payload.getResponse();
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

  if (!partial) {
    try {
      await legacy.tagsAndCustom.set(agenda.id, payload.getItem('event.uid'), [
        agenda.formSchema,
        _.get(agenda, 'network.formSchema')
      ], [
        clean.custom,
        clean.networkCustom
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

  const response = payload.getResponse();

  try {
    await eventSearch.update({
      agenda,
      formSchema: response.formSchema,
      member: response.member,
      event: response.updated
    });
  } catch (e) {
    log('error', 'could not update search indices for event %s.%s', agenda.uid, eventUid, e);
  }

  await aggregators.notify('updateEvent', {
    event: response.updated,
    before: response.before,
    agenda,
    formSchema: response.formSchema,
    batched
  });

  return response;
}




