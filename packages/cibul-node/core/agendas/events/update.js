"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const VError = require( 'verror' );

const agendaEvents = require( '@openagenda/agenda-events' );
const agendas = require( '@openagenda/agendas' );
const events = require( '@openagenda/events' );
const log = require( '@openagenda/logs' )( 'core/agendas/events/update' );
const { toEventServiceFormat } = require( '@openagenda/agenda-contribute/server/parse' );

const getAgendaWithNetworkAndSchemas = require( '../utils/getAgendaWithNetworkAndSchemas' );
const legacy = require( '../../../services/legacy' );
const processOEmbed = require( '../utils/processOEmbed' );
const setCustom = require( '../utils/setCustom' );
const validate = require( './validate' );

module.exports = async ( agendaUid, eventUid, data, options = {} ) => {

  log( 'processing', { agendaUid, eventUid, options } );

  const contextUserUid = _.get( options, 'context.userUid' ) || _.get( data, 'creatorUid' );

  const {
    draft,
    partial,
    formSchemaDataFormat,
    defaultLang,
    batched
  } = _.assign( {
    draft: false,
    partial: false,
    formSchemaDataFormat: false,
    defaultLang: 'en',
    batched: false
  }, options || {} );

  const agenda = await getAgendaWithNetworkAndSchemas( agendaUid );

  const {
    network,
    formSchemaId,
    id: agendaId
  } = agenda;

  const updated = {};

  // pre-validate data. if state is not specified, it should not be forced.
  const clean = await validate.loaded( {
    formSchema: agenda.formSchema,
    networkFormSchema: _.get( agenda, 'network.formSchema' ),
    defaultLang
  }, data, { draft, formSchemaDataFormat, optionalState: true, partial } );

  if ( clean.event.longDescription ) try {

    clean.event.links = await processOEmbed( clean.event.longDescription, clean.event.links );

    log( 'retrieved %s links', clean.event.links.length );

  } catch ( e ) {

    log( 'error', 'could not retrieve oembeds', e );

  }

  let result;

  const eventServiceDataFormat = toEventServiceFormat( clean.event, null, {
    raw: data,
    partial
  } );

  try {
    result = await events.update( { uid: eventUid }, eventServiceDataFormat, {
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
  } catch ( e ) {
    log( 'error', 'failed to update event', {
      agendaUid: agenda.uid,
      eventUid,
      eventServiceDataFormat
    } );
    throw e;
  }

  if ( !result.valid ) {

    log( 'error', 'update was not successful', result );

    throw new VError( {
      name: 'validationError',
      info: {
        errors: result.errors
      }
    } );

  } else {

    updated.event = result.event;

  }

  if ( !draft && clean.agendaEvent ) {

    result = await agendaEvents( agendaUid ).set( updated.event.uid, ih( clean.agendaEvent, {
      create: {
        $set: { canEdit: true }
      }
    } ), {
      transferToLegacy: true,
      context: {
        aggregated: false,
        legacy: false,
        userUid: contextUserUid,
        event: updated.event,
        agenda,
        batched
      },
      decorate: ['member']
    } );

    updated.agendaEvent = result.set;

  }

  if ( agenda.formSchemaId && clean.custom ) {

    const result = await setCustom( agenda.formSchemaId, updated.event.uid, clean.custom, { draft, agendaId, partial } );

    if ( result.success ) updated.custom = result.custom;

  }

  if ( agenda.network && clean.networkCustom ) {

    const result = await setCustom( agenda.network.formSchemaId, updated.event.uid, clean.networkCustom, { agendaId, partial } );

    if ( result.success ) updated.networkCustom = result.custom;

  }

  if ( !draft && !partial ) {
    try {
      await legacy.tagsAndCustom.set( agenda.id, updated.event.uid, [
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

  return {
    success: true,
    updated
  }

}
