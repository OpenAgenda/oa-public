"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const formSchemas = require( '@openagenda/form-schemas' );
const FormSchema = require( '@openagenda/form-schemas/iso/FormSchema' );

const log = require( '@openagenda/logs' )( 'core/agendas/events/validate' );
const validate = require( '@openagenda/events/service/validate' );
const validateAgendaEvent = require( '@openagenda/agenda-events' ).validate;

const eventSchema = require( '@openagenda/event-form/build/schema' );
const extractLanguages = require( '@openagenda/event-form/build/utils/extractLanguages' );
const { fromEventServiceFormat } = require( '@openagenda/agenda-contribute/server/parse' );

const getAgenda = require( '../utils/getAgenda' );

module.exports = async ( agendaUid, data ) => {

  const agenda = await getAgenda( agendaUid );

  return await loaded( agenda, data );

}

module.exports.loaded = async function loaded( { formSchemaId, networkFormSchemaId }, data, options = {} ) {

  const { draft, evaluateEvent, formSchemaDataFormat, defaultLang } = _.assign( {
    defaultLang: null,
    evaluateEvent: true,
    draft: false,
    formSchemaDataFormat: false
  }, typeof options === 'boolean' ? { evaluateEvent: options } : options );

  // api provides event data in event service format ( deep image object that includes credits )
  const formSchemaData = formSchemaDataFormat ? data : fromEventServiceFormat( data );

  const schemaExtensions = await _loadExtendedSchemas( { formSchemaId, networkFormSchemaId } );

  const consolidatedSchema = eventSchema( {
    languages: extractLanguages( data, defaultLang ),
    schemaExtensions: _asArray( schemaExtensions ),
    excludeEventFields: !evaluateEvent
  } );

  const clean = {
    event: null,
    custom: null,
    networkCustom: null,
    agendaEvent: null
  };

  const errors = [];

  // clean consolidated schemas data
  
  try {

    const validate = new FormSchema( consolidatedSchema ).getValidate( { draft } );

    const consolidatedClean = validate( formSchemaData );

    _.assign( clean, _distributeCleanData( consolidatedClean, schemaExtensions ) );

  } catch( consolidatedErrors ) {

    console.log(consolidatedErrors);

    consolidatedErrors.forEach( err => errors.push( _.set( err, 'step', 'validation' ) ) );

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


async function _loadExtendedSchemas( { formSchemaId, networkFormSchemaId } ) {

  const schemas = {
    network: null, 
    agenda: null
  };

  if ( formSchemaId ) {

    log( 'loading agenda form schema' );

    schemas.agenda = await formSchemas.get( formSchemaId );

  }

  // clean network custom data
  
  if ( networkFormSchemaId ) {

    log( 'loading network form schema' );

    schemas.network = await formSchemas.get( networkFormSchemaId );

  }

  return schemas;

}


function _distributeCleanData( consolidatedClean, schemaExtensions ) {

  const fieldsPerSchema = {
    agenda: schemaExtensions.agenda ? schemaExtensions.agenda.fields.filter( f => f.fieldType && f.fieldType !== 'abstract' ).map( f => f.field ) : [],
    network: schemaExtensions.network ? schemaExtensions.network.fields.filter( f => f.fieldType && f.fieldType !== 'abstract' ).map( f => f.field ) : [],
    event: []
  };

  fieldsPerSchema.event = _.keys( consolidatedClean ).filter( field => !fieldsPerSchema.agenda.includes( field ) && !fieldsPerSchema.network.includes( field ) );
  
  return {
    custom: _.pick( consolidatedClean, fieldsPerSchema.agenda ),
    networkCustom: _.pick( consolidatedClean, fieldsPerSchema.network ),
    event: _.pick( consolidatedClean, fieldsPerSchema.event )
  }

}


function _consolidatedValidate( schema, data, { draft } ) {

  const fs = new FormSchema( schema );

  const validate = fs.getValidate( { draft } );

  return validate( data );

}


function _asArray( obj ) {

  return _.keys( obj ).map( k => obj[ k ] ).filter( s => !!s )

}
