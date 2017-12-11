"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const formSchemas = require( '@openagenda/form-schemas' );
const validateEvent = require( '@openagenda/events/service/validate/front' );
const validateAgendaEvent = require( '@openagenda/agenda-events' ).validate;


const getAgenda = require( '../utils/getAgenda' );

module.exports = async ( agendaUid, data ) => {

  const agenda = await getAgenda( agendaUid );

  return loaded( agenda, data );

}

module.exports.loaded = async function loaded( { formSchemaId }, data, evaluateEvent = true ) {

  let errors = [];

  let clean = {
    custom: null,
    agendaEvent: null
  }

  if ( evaluateEvent ) {

    clean.event = null;
    
    // clean event
    try {

      clean.event = validateEvent( data );

    } catch( eventValidationErrors ) {

      errors = errors.concat( eventValidationErrors );

    }

  }



  // clean custom data

  if ( formSchemaId ) {

    const validateCustom = await formSchemas.getValidator( formSchemaId );

    try {

      clean.custom = validateCustom( data );

    } catch( customDataErrors ) {

      errors = errors.concat( customDataErrors );

    }

  }


  // clean agenda-event data
  
  try {

    clean.agendaEvent = validateAgendaEvent( data );

  } catch( agendaEventErrors ) {

    errors = errors.concat( agendaEventErrors );

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