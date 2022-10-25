'use strict';

const _ = require('lodash');
const VError = require('verror');

const log = require('@openagenda/logs')('core/agendas/utils/doAdd');
const refreshAgenda = require('./refreshAgenda');
const setCustom = require('./setCustom');

module.exports = async (core, payload, clean, options = {}) => {
  const agenda = payload.getAgenda();
  const event = payload.getEvent();

  const {
    services,
  } = core;

  const {
    aggregators,
    agendaEvents,
    eventSearch,
    custom,
    tracker,
    elasticsearch: legacyEventSearch,
    legacy,
  } = services;

  log('info', 'processing agenda %s, event %s', agenda.uid, event.uid);
  tracker('core.agendas.doAdd');

  const {
    batched,
    aggregated,
    sourceAgenda,
    draft,
    userUid,
    access,
    duplicateOrigin,
  } = {
    batched: false,
    aggregated: null,
    sourceAgenda: null,
    draft: false,
    access: 'public',
    ...options,
  };

  if (!userUid) {
    log('warn', 'user is not identified');
  }

  if (!draft) {
    try {
      const { created, before } = await agendaEvents(agenda.uid).create(event.uid, clean.agendaEvent, {
        transferToLegacy: true, // directive to replicate to legacy data structure
        aggregated,
        context: {
          event,
          agenda,
          legacy: false,
          batched,
          aggregated,
          sourceAgenda,
          userUid,
          duplicateOrigin,
        },
        decorate: ['member', 'sourceAgendas'],
      });

      payload.setItem('agendaEvent', before, created);
    } catch (e) {
      throw new VError(e, 'Could not create agenda-event reference for agenda uid %s and event uid %s', agenda.uid, event.uid);
    }
  }

  // create custom data
  if (agenda.formSchemaId && clean.custom) {
    const result = await setCustom(custom, agenda.formSchemaId, event.uid, clean.custom, {
      draft,
      agendaId: clean.agendaId,
    });

    if (result.errors.length) {
      log('error', 'could not set custom data', result.errors);
    }

    payload.setItem('custom.agenda', result.before, result.custom);
  }

  if (_.get(agenda, 'network.formSchemaId') && clean.networkCustom) {
    const result = await setCustom(custom, agenda.network.formSchemaId, event.uid, clean.networkCustom, {
      draft,
      agendaId: clean.agendaId,
    });

    if (result.errors.length) {
      log('error', 'could not set network custom data', result.errors);
    }

    payload.setItem('custom.network', result.before, result.custom);
  }

  if (draft) {
    return payload.getResponse('event', access);
  }

  log('info', 'syncing legacy custom and tag data');
  try {
    await legacy.tagsAndCustom.set(agenda.id, event.uid, [
      agenda.formSchema,
      _.get(agenda, 'network.formSchema'),
    ], [
      clean.custom,
      clean.networkCustom,
    ]);
  } catch (e) {
    log('error', 'failed to set legacy tags and custom data for agenda id %s and event uid %s', agenda.id, event.uid, e);
  }

  if (userUid && await core.agendas(agenda).settings.isOpen() && !await core.agendas(agenda).members.is(userUid, { access: 'internal' })) {
    log('user %s is not a member on open contribution agenda that does not require member info.', userUid);
    await core.agendas(agenda).members.create(userUid, 'contributor', {}, {
      access: 'internal',
      useAccountEmail: true,
    });
  }

  try {
    await legacyEventSearch.updateEvent({ uid: event.uid });
  } catch (e) {
    log('error', 'could not update legacy search for event %s', event.uid);
  }

  const response = await payload.getResponse('event', access);
  const compiledEvent = await payload.getCompiledEvent(); // full access for internal use
  const formSchema = payload.getFormSchema(); // full access for internal use

  try {
    await eventSearch.add({
      ...response,
      event: compiledEvent,
    });
  } catch (e) {
    log('error', 'could not add event %s.%s to search indices', agenda.uid, event.uid, e);
  }

  await aggregators.notify('addEvent', {
    event: compiledEvent,
    agenda,
    formSchema,
    batched,
  });

  await refreshAgenda(agenda.uid);

  return response;
};
