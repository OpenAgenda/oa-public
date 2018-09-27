"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const agendaEvents = require( '@openagenda/agenda-events' );
const agendas = require( '@openagenda/agendas' );
const custom = require( '@openagenda/custom' );
const events = require( '@openagenda/events' );
const formSchemas = require( '@openagenda/form-schemas' );
const log = require( '@openagenda/logs' )( 'core/agendas/events/update' );

const getAgenda = require( '../utils/getAgenda' );
const validate = require( './validate' );


module.exports = async ( agendaUid, eventUid, data, options = {} ) => {

  log( 'processing', { agendaUid, eventUid, options } );

  const { draft } = _.assign( {
    draft: false
  }, options || {} );

  const {
    formSchemaId,
    id: agendaId
  } = await getAgenda( agendaUid );

  const updated = {};

  // pre-validate data
  const clean = await validate.loaded( { formSchemaId }, data, { draft } );

  // update the event
  let result = await events.update( { uid: eventUid }, clean.event, { 
    context: { agendaUid, updateSearchIndex: false },
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
    
    result = await agendaEvents( agendaUid ).update( updated.event.uid, clean.agendaEvent, { 
      transferToLegacy: true, 
      context: { legacy: false }
    } );

    updated.agendaEvent = result.updated;

  }

  if ( clean.custom ) {

    const result = await custom( formSchemaId ).set( updated.event.uid, clean.custom, {
      transferToLegacy: !draft, 
      agendaId,
      context: { legacy: false },
      draft
    } );

    if ( result.success ) {

      updated.custom = result.custom;

    }

  }

  return {
    success: true,
    updated
  }

}
