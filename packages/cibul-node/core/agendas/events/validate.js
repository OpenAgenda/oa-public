"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const formSchemas = require( '@openagenda/form-schemas' );
const log = require( '@openagenda/logs' )( 'core/agendas/events/validate' );
const validate = require( '@openagenda/events/service/validate' );
const validateAgendaEvent = require( '@openagenda/agenda-events' ).validate;

const getAgenda = require( '../utils/getAgenda' );

module.exports = async ( agendaUid, data ) => {

  const agenda = await getAgenda( agendaUid );

  return await loaded( agenda, data );

}

module.exports.loaded = async function loaded( { formSchemaId }, data, options = {} ) {

  const { draft, evaluateEvent } = _.assign( {
    evaluateEvent: true,
    draft: false
  }, typeof options === 'boolean' ? { evaluateEvent: options } : options );

  log( 'validating full agenda event data' );

  let errors = [];

  const clean = {
    custom: null,
    agendaEvent: null
  }

  if ( evaluateEvent ) {

    log( 'evaluating event data' );

    clean.event = null;
    
    // clean event
    try {

      validate[ draft ? 'draft' : 'front' ]( data, { optionalSlug: true } );

    } catch( eventValidationErrors ) {

      log( 'info', 'received event validation errors', eventValidationErrors );

      errors = errors.concat( eventValidationErrors );

      log( 'received validation errors for event data', { count: eventValidationErrors.length } );

    }

    clean.event = data;

  }



  // clean custom data

  if ( formSchemaId ) {

    log( 'evaluating custom data' );

    const validateCustom = await formSchemas.getValidator( formSchemaId, { draft } );

    try {

      clean.custom = validateCustom( data );

    } catch( customDataErrors ) {

      errors = errors.concat( customDataErrors );

      log( 'received validation errors for custom data', { count: customDataErrors.length } )

    }

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

    log( 'received validation errors for agenda-event reference data', { count: agendaEventErrors.length } );

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
