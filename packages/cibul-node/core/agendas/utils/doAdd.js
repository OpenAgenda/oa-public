"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const VError = require( 'verror' );

const addContributor = require( './addContributor' );
const { agendaIsOpen, userIsNotMember } = addContributor;
const legacy = require( '../../../services/legacy' );
const aggregators = require('../../../services/aggregators').instance;
const legacyEventSearch = require('../../../services/elasticsearch');
const setCustom = require('./setCustom');
const merge = require('./merge');

const log = require('@openagenda/logs')('core/agendas/utils/doAdd');

module.exports = async (services, payload, clean, options = {}) => {
  const agenda = payload.getAgenda();
  const event = payload.getEvent();

  const {
    agendaEvents,
    eventSearch
  } = services;

  log('info', 'processing agenda %s, event %s', agenda.uid, event.uid);

  const {
    batched,
    aggregated,
    sourceAgenda,
    draft,
    userUid
  } = {
    batched: false,
    aggregated: false,
    sourceAgenda: null,
    draft: false,
    userUid: null,
    ...options
  };

  if (!userUid) {
    log('warn', 'user is not identified');
  }

  if (!draft) {
    try {
      const { created, before } = await agendaEvents(agenda.uid).create(event.uid, clean.agendaEvent, {
        transferToLegacy: true, // directive to replicate to legacy data structure
        context: {
          event,
          agenda,
          legacy: false,
          batched,
          aggregated,
          sourceAgenda,
          userUid
        },
        decorate: ['member']
      });

      payload.setItem('agendaEvent', before, created);
    } catch (e) {
      throw new VError(e, 'Could not create agenda-event reference for agenda uid %s and event uid %s', agenda.uid, event.uid);
    }
  }

  // create custom data
  if (agenda.formSchemaId && clean.custom) {
    const result = await setCustom(agenda.formSchemaId, event.uid, clean.custom, {
      draft,
      agendaId: clean.agendaId
    });

    if (result.errors.length) {
      log( 'error', 'could not set custom data', result.errors );
    }

    payload.setItem('custom.agenda', result.before, result.custom);
  }

  if (_.get(agenda, 'network.formSchemaId') && clean.networkCustom) {
    const result = await setCustom(agenda.network.formSchemaId, event.uid, clean.networkCustom, {
      draft,
      agendaId: clean.agendaId
    });

    if (result.errors.length) {
      log('error', 'could not set network custom data', result.errors);
    }

    payload.setItem('custom.network', result.before, result.custom);
  }

  if (draft) {
    return;
  }


  log('info', 'syncing legacy custom and tag data');
  try {
    await legacy.tagsAndCustom.set(agenda.id, event.uid, [
      agenda.formSchema,
      _.get( agenda, 'network.formSchema' )
    ], [
      clean.custom,
      clean.networkCustom
    ]);
  } catch (e) {
    log('error', 'failed to set legacy tags and custom data for agenda id %s and event uid %s', agenda.id, event.uid, e);
  }

  if (userUid && agendaIsOpen(agenda) && await userIsNotMember(agenda, userUid)) {
    log('user %s is not a member on open contribution agenda that does not require member info.', userUid);
    await addContributor(agenda, userUid);
  }

  try {
    await legacyEventSearch.updateEvent({ uid: event.uid });
  } catch (e) {
    log('error', 'could not update legacy search for event %s', event.uid);
  }

  const response = payload.getResponse();

  try {
    await eventSearch.add({
      agenda,
      formSchema: response.formSchema,
      member: response.member,
      event: response[payload.getOperation()]
    });
  } catch (e) {
    log('error', 'could not add event %s.%s to search indices', agenda.uid, event.uid);
  }

  await aggregators.notify('addEvent', {
    event: response.created,
    agenda,
    formSchema: response.formSchema,
    batched
  });
}
