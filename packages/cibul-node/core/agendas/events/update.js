"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const VError = require( 'verror' );

const log = require( '@openagenda/logs' )( 'core/agendas/events/update' );
const { toEventServiceFormat } = require( '@openagenda/agenda-contribute/server/parse' );

const getAgendaWithNetworkAndSchemas = require( '../utils/getAgendaWithNetworkAndSchemas' );
const aggregators = require('../../../services/aggregators').instance;
const legacy = require('../../../services/legacy');
const legacyEventSearch = require('../../../services/elasticsearch');
const processOEmbed = require( '../utils/processOEmbed' );
const setCustom = require( '../utils/setCustom' );
const merge = require('../utils/merge');
const validate = require( './validate' );

module.exports = async (services, agendaUid, eventUid, data, options = {}) => {
  const {
    events,
    agendas,
    agendaEvents,
    eventSearch
  } = services;

  log('processing', { agendaUid, eventUid, options });

  const contextUserUid = _.get( options, 'context.userUid' ) || _.get( data, 'creatorUid' );

  const {
    draft,
    partial,
    formSchemaDataFormat,
    defaultLang,
    batched
  } = Object.assign({
    draft: false,
    partial: false,
    formSchemaDataFormat: false,
    defaultLang: 'en',
    batched: false
  }, options || {});

  const agenda = await getAgendaWithNetworkAndSchemas(agendaUid);

  const {
    network,
    formSchemaId,
    id: agendaId
  } = agenda;

  const servicesResults = {
    before: {},
    updated: {}
  };

  // pre-validate data. if state is not specified, it should not be forced.
  const clean = await validate.loaded({
    formSchema: agenda.formSchema,
    networkFormSchema: _.get( agenda, 'network.formSchema' ),
    defaultLang
  }, data, { draft, formSchemaDataFormat, optionalSecondaryFields: true, partial });

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
    log( 'error', 'update was not successful', result );
    throw new VError( {
      name: 'validationError',
      info: {
        errors: result.errors
      }
    } );
  } else {
    servicesResults.before.event = result.before;
    servicesResults.updated.event = result.event;
  }

  if (agenda.formSchemaId && clean.custom) {
    const result = await setCustom(
      agenda.formSchemaId,
      servicesResults.updated.event.uid,
      clean.custom, {
        draft,
        agendaId,
        partial
      }
    );
    if (result.success) {
      _.set(servicesResults, 'before.custom.agenda', result.before);
      _.set(servicesResults, 'updated.custom.agenda', result.custom);
    }
  }

  if (agenda.network && clean.networkCustom) {
    const result = await setCustom(
      agenda.network.formSchemaId,
      servicesResults.updated.event.uid,
      clean.networkCustom, {
        agendaId, partial
      }
    );

    if (result.success) {
      _.set(servicesResults, 'before.custom.network', result.before);
      _.set(servicesResults, 'updated.custom.network', result.custom);
    }
  }

  if (draft) {
    return {
      success: true,
      ..._compile(servicesResults)
    }
  }


  // event is not draft (anymore)

  if (clean.agendaEvent) {
    try {
      result = await agendaEvents(agendaUid).set(servicesResults.updated.event.uid, ih(clean.agendaEvent, {
        create: {
          $set: { canEdit: true }
        }
      }), {
        transferToLegacy: true,
        context: {
          aggregated: false,
          legacy: false,
          userUid: contextUserUid,
          event: servicesResults.updated.event,
          agenda,
          batched
        },
        decorate: ['member']
      });
    } catch(e) {
      console.log('failed to update agendaEvent ref', e);
      throw e;
    }

    servicesResults.updated.agendaEvent = result.set;
    servicesResults.before.agendaEvent = result.before;
  }

  if (!partial) {
    try {
      await legacy.tagsAndCustom.set( agenda.id, servicesResults.updated.event.uid, [
        agenda.formSchema,
        _.get( agenda, 'network.formSchema' )
      ], [
        clean.custom,
        clean.networkCustom
      ] );
    } catch ( e ) {
      log( 'error', 'failed to set legacy tags and custom data', e );
    }
  }

  try {
    await legacyEventSearch.updateEvent({ uid: eventUid });
  } catch (e) {
    log('error', 'could not update legacy search for event %s', eventUid, e);
  }

  const response = _compile(servicesResults);

  try {
    await eventSearch.update(response.updated);
  } catch (e) {
    log('error', 'could not update search indices for event %s.%s', agenda.uid, eventUid, e);
  }

  await aggregators.notify('updateEvent', {
    event: response.updated,
    before: response.before,
    agenda,
    formSchema: merge.schemas(
      _.get(agenda, 'network.formSchema'),
      _.get(agenda, 'formSchema')
    ),
    batched
  });

  return {
    ...response,
    success: true
  }
}

function _compile(servicesResults) {
  return {
    updated: merge.eventFromObject(servicesResults.updated),
    before: servicesResults.before.agendaEvent ? merge.eventFromObject(servicesResults.before) : null
  };
}
