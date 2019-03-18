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

const getAgendaWithNetworkAndSchemas = require( '../utils/getAgendaWithNetworkAndSchemas' );
const getLocation = require( '../utils/getLocation' );

module.exports = async ( agendaUid, data ) => {

  const agenda = await getAgendaWithNetworkAndSchemas( agendaUid );

  return await loaded( {
    formSchema: agenda.formSchema,
    networkFormSchema: _.get( agenda, 'network.formSchema' )
  }, data );

}

module.exports.loaded = async function loaded( { formSchema, networkFormSchema }, data, options = {} ) {

  const { draft, evaluateEvent, formSchemaDataFormat, defaultLang, optionalState } = _.assign( {
    defaultLang: null,
    evaluateEvent: true,
    draft: false,
    formSchemaDataFormat: false,
    optionalState: false
  }, typeof options === 'boolean' ? { evaluateEvent: options } : options );

  // api provides event data in event service format ( deep image object that includes credits and variants )
  const formSchemaData = formSchemaDataFormat ? data : fromEventServiceFormat( data, {
    location: await getLocation( data )
  } );

  const schemaExtensions = {
    network: networkFormSchema,
    agenda: formSchema
  };

  // Define which languages should be included. Should depend on
  //  * agenda setting ( if set ) ( not yet coded )
  //  * submitted language keys in languages field
  //  * default language

  const languages = _.get( data, 'languages' ) || extractLanguages( data, defaultLang );

  log( 'processed languages: %j', languages );

  const consolidatedSchema = eventSchema( {
    languages,
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

  } catch ( consolidatedErrors ) {

    if ( !_.isArray( consolidatedErrors ) ) {

      log( 'error', 'exception during validation', consolidatedErrors );

      throw new VError( 'api validation exception', consolidatedErrors );

    }

    consolidatedErrors.forEach( err => errors.push( _.set( err, 'step', 'validation' ) ) );

  }

  // clean agenda-event data

  try {

    log( 'evaluating agenda-event reference data' );

    if ( !data.userUid && data.ownerUid ) {

      data.userUid = data.ownerUid;

    }

    clean.agendaEvent = validateAgendaEvent( data, { optionalState } );

  } catch( agendaEventErrors ) {

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
