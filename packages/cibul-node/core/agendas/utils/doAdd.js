"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const VError = require( 'verror' );

const agendaEvents = require( '@openagenda/agenda-events' );

const addContributor = require( './addContributor' );
const { agendaIsOpen, userIsNotMember } = addContributor;
const legacy = require( '../../../services/legacy' );
const legacyEventSearch = require('../../../services/elasticsearch');
const setCustom = require( './setCustom' );

const log = require( '@openagenda/logs' )( 'core/agendas/utils/doAdd' );

module.exports = async ( agenda, eventUid, clean, options = {} ) => {

  log( 'info', 'processing agenda %s, event %s', agenda.uid, eventUid );

  const { draft, context } = _.assign( {
    draft: false,
    context: {
      userUid: null
    }
  }, options );

  const added = {
    agendaEvent: null,
    custom: null
  };

  if ( !context.userUid ) {
    log( 'warn', 'user is not identified' );
  }

  if ( !draft ) {

    try {

      const { created } = await agendaEvents( agenda.uid ).create( eventUid, clean.agendaEvent, {
        transferToLegacy: true, // directive to replicate to legacy data structure
        context: ih( context, { legacy: { $set: false } } ),
        decorate: ['member']
      } );

      added.agendaEvent = created;

    } catch ( e ) {

      throw new VError( e, 'Could not create agenda-event reference for agenda uid %s and event uid %s', agenda.uid, eventUid );

    }

  }

  // create custom data
  if ( agenda.formSchemaId && clean.custom ) {

    const result = await setCustom( agenda.formSchemaId, eventUid, clean.custom, {
      draft,
      agendaId: clean.agendaId
    } );

    if ( result.errors.length ) {

      log( 'error', 'could not set custom data', result.errors );

    }

    added.custom = result.custom;

  }

  if ( _.get( agenda, 'network.formSchemaId' ) && clean.networkCustom ) {

    const result = await setCustom( agenda.network.formSchemaId, eventUid, clean.networkCustom, {
      draft,
      agendaId: clean.agendaId
    } );

    if ( result.errors.length ) {
      log( 'error', 'could not set network custom data', result.errors );
    }

    added.networkCustom = result.custom;

  }

  if ( !draft ) {
    log( 'info', 'syncing legacy custom and tag data' );
    try {
      await legacy.tagsAndCustom.set( agenda.id, eventUid, [
        agenda.formSchema,
        _.get( agenda, 'network.formSchema' )
      ], [
        clean.custom,
        clean.networkCustom
      ] );
    } catch ( e ) {
      log( 'error', 'failed to set legacy tags and custom data for agenda id %s and event uid %s', agenda.id, eventUid, e );
    }
  }

  if ( context.userUid && agendaIsOpen( agenda ) && await userIsNotMember( agenda, context.userUid ) ) {
    log( 'user %s is not a member on open contribution agenda that does not require member info.', context.userUid );
    await addContributor( agenda, context.userUid );
  }

  if (!draft) {
    try {
      await legacyEventSearch.updateEvent({ uid: eventUid });
    } catch (e) {
      log('error', 'could not update legacy search for event %s', eventUid);
    }
  }

  return {
    success: true,
    added
  }

}
