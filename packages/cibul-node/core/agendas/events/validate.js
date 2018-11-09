"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const formSchemas = require( '@openagenda/form-schemas' );
const log = require( '@openagenda/logs' )( 'core/agendas/events/validate' );
const validate = require( '@openagenda/events/service/validate' );
const validateAgendaEvent = require( '@openagenda/agenda-events' ).validate;

const { toEventServiceFormat } = require( '@openagenda/agenda-contribute/server/parse' );

const getAgenda = require( '../utils/getAgenda' );

module.exports = async ( agendaUid, data ) => {

  const agenda = await getAgenda( agendaUid );

  return await loaded( agenda, data );

}

module.exports.loaded = async function loaded( { formSchemaId, networkFormSchemaId }, data, options = {} ) {

  const { draft, evaluateEvent, formSchemaDataFormat } = _.assign( {
    evaluateEvent: true,
    draft: false,
    formSchemaDataFormat: false
  }, typeof options === 'boolean' ? { evaluateEvent: options } : options );

  log( 'validating full agenda event data in %s format', formSchemaDataFormat ? 'form schema format' : 'event service format' );

  const errors = [];

  const clean = {
    custom: null,
    agendaEvent: null
  }

  if ( evaluateEvent ) {

    log( 'evaluating event data' );

    clean.event = null;

    const eventServiceFormattedData = formSchemaDataFormat ? toEventServiceFormat( data ) : data;
    
    // clean event
    try {

      validate[ draft ? 'draft' : 'front' ]( eventServiceFormattedData, { optionalSlug: true } );

    } catch( eventValidationErrors ) {

      log( 'info', 'received event validation errors', eventValidationErrors );

      eventValidationErrors.forEach( err => errors.push( _.set( err, 'step', 'event data validation' ) ) );

    }

    clean.event = eventServiceFormattedData;

  }


  if ( formSchemaId ) {

    log( 'evaluating custom data' );

    const result = await _evaluateCustom( formSchemaId, data, { draft } );

    clean.custom = result.clean;

    result.errors.forEach( err => errors.push( _.set( err, 'step', 'agenda custom data validation' ) ) );

  }

  // clean network custom data
  
  if ( networkFormSchemaId ) {

    log( 'evaluating network custom data' );

    const result = await _evaluateCustom( networkFormSchemaId, data, { draft } );

    clean.networkCustom = result.clean;

    result.errors.forEach( err => errors.push( _.set( err, 'step', 'network custom data validation' ) ) );

  }

  // clean agenda-event data
  
  try {

    log( 'evaluating agenda-event reference data' );

    if ( !data.userUid && data.ownerUid ) {

      data.userUid = data.ownerUid;

    }

    clean.agendaEvent = validateAgendaEvent( data );

  } catch( agendaEventErrors ) {

    errors = errors.concat( agendaEventErrors );

    agendaEventErrors.forEach( err => errors.push( _.set( err, 'step', 'agenda event data validation' ) ) );

  }

  if ( errors.length ) {

    throw new VError( {
      name: 'validationError',
      info: {
        errors
      }
    } );

  }

  return clean;

}


async function _evaluateCustom( formSchemaId, data, options ) {

  const validateCustom = await formSchemas.getValidator( formSchemaId, options );

  try {

    const clean = validateCustom( data );

    return { clean, errors: [] }

  } catch( errors ) {

    return { clean: null, errors }

  }  

}
