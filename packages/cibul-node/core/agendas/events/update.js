"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const VError = require( 'verror' );

const agendaEvents = require( '@openagenda/agenda-events' );
const agendas = require( '@openagenda/agendas' );
const events = require( '@openagenda/events' );
const formSchemas = require( '@openagenda/form-schemas' );
const log = require( '@openagenda/logs' )( 'core/agendas/events/update' );

const getAgenda = require( '../utils/getAgenda' );
const getNetwork = require( '../utils/getNetwork' );
const setCustom = require( '../utils/setCustom' );
const validate = require( './validate' );


module.exports = async ( agendaUid, eventUid, data, options = {} ) => {

  log( 'processing', { agendaUid, eventUid, options } );

  const { draft } = _.assign( {
    draft: false
  }, options || {} );

  const {
    networkFormSchemaId,
    formSchemaId,
    networkUid,
    id: agendaId
  } = await getAgenda( agendaUid );

  const network = await getNetwork( networkUid );

  const updated = {};

  // pre-validate data
  const clean = await validate.loaded( { 
    formSchemaId,
    networkFormSchemaId: _.get( network, 'formSchemaId' )
  }, data, { draft } );

  // update the event
  let result = await events.update( { uid: eventUid }, clean.event, { 
    context: {
      agendaUid,
      userUid: _.get( options, 'context.userUid', null ),
      updateSearchIndex: false
    },
    transferToLegacy: !draft,
    draft
  } );

  if ( !result.valid ) {

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
      context: { legacy: false }
    } );

    updated.agendaEvent = result.set;

  }

  if ( formSchemaId && clean.custom ) {

    const result = await setCustom( formSchemaId, updated.event.uid, clean.custom, { draft, agendaId } );

    if ( result.success ) updated.custom = result.custom;

  }

  if ( networkFormSchemaId && clean.networkCustom ) {

    const result = await setCustom( networkFormSchemaId, updated.event.uid, clean.networkCustom, { draft } );

    if ( result.success ) updated.networkCustom = result.custom;

  }

  return {
    success: true,
    updated
  }

}
