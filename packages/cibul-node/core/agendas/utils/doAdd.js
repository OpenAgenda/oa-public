"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const VError = require( 'verror' );

const agendaEvents = require( '@openagenda/agenda-events' );

const addContributor = require( './addContributor' );
const { agendaIsOpen, userIsNotMember } = addContributor;
const legacy = require( '../../../services/legacy' );
const aggregators = require('../../../services/aggregators').instance;
const legacyEventSearch = require('../../../services/elasticsearch');
const setCustom = require('./setCustom');
const merge = require('./merge');

const log = require('@openagenda/logs')('core/agendas/utils/doAdd');

module.exports = async (agenda, event, clean, options = {}) => {
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

  const added = {
    agendaEvent: null,
    custom: null
  };

  if (!userUid) {
    log('warn', 'user is not identified');
  }

  if (!draft) {
    try {
      const { created } = await agendaEvents(agenda.uid).create(event.uid, clean.agendaEvent, {
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

      added.agendaEvent = created;
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

    added.custom = result.custom;
  }

  if (_.get(agenda, 'network.formSchemaId') && clean.networkCustom) {
    const result = await setCustom(agenda.network.formSchemaId, event.uid, clean.networkCustom, {
      draft,
      agendaId: clean.agendaId
    });

    if (result.errors.length) {
      log('error', 'could not set network custom data', result.errors);
    }

    added.networkCustom = result.custom;
  }

  if (draft) {
    return {
      success: true,
      added
    }
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

  await aggregators.notify('addEvent', {
    event: merge.event(event, added.agendaEvent, added.networkCustom, added.custom),
    agenda,
    formSchema: merge.schemas(
      _.get(agenda, 'network.formSchema'),
      _.get(agenda, 'formSchema')
    ),
    batched
  });

  return {
    success: true,
    added
  }
}
