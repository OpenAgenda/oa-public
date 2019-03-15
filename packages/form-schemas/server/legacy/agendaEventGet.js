"use strict";

const _ = require( 'lodash' );

const FormSchema = require( '../../iso/FormSchema' );
const VError = require( 'verror' );

let config, service, client, legacy;

module.exports = async ( agendaId, eventId ) => {

  let formSchema, data, tags, customData, category, defaultValues;

  let agenda = await client( config.legacy.schemas.agenda )
    .select( [ 'form_schema_id' ] )
    .where( { id: agendaId } )
    .then( rows => rows.length ? rows[ 0 ] : null );

  if ( !agenda ) {

    throw new Error( 'agenda of id %s not found', agendaId );

  }

  formSchema = agenda.form_schema_id ? await service.get( agenda.form_schema_id ) : ( await legacy.transfer( agendaId ) ).formSchema;

  defaultValues = ( new FormSchema( formSchema ) ).getValidate().default;

  customData = await _fetchCustomData( formSchema, agendaId, eventId );

  tags = await _fetchTags( formSchema, agendaId, eventId );

  category = await _fetchCategory( formSchema, agendaId, eventId );

  return _.extend( defaultValues, customData, tags, category );

}

async function _fetchCategory( formSchema, agendaId, eventId ) {

  let clean = {};

  let eventCategoryLegacyId = await client( config.legacy.schemas.agendaEvent )

    .first( 'category_id' )

    .where( config.legacy.schemas.agendaEvent + '.event_id', eventId )

    .andWhere( config.legacy.schemas.agendaEvent + '.review_id', agendaId );


  if ( eventCategoryLegacyId ) {

    eventCategoryLegacyId = eventCategoryLegacyId.category_id;

  }

  if ( !eventCategoryLegacyId ) return {};

  let matching = _extractMatchingOption( formSchema, eventCategoryLegacyId );

  clean[ matching.field ] = matching.id;

  return clean;

}

async function _fetchTags( formSchema, agendaId, eventId ) {

  let clean = {};

  let eventTagLegacyIds = await client( config.legacy.schemas.agendaEventTag )

    .leftJoin( config.legacy.schemas.agendaEvent, config.legacy.schemas.agendaEvent + '.id', config.legacy.schemas.agendaEventTag + '.review_article_id' )

    .where( config.legacy.schemas.agendaEvent + '.review_id', agendaId )

    .andWhere( config.legacy.schemas.agendaEvent + '.event_id', eventId )

    .map( r => r.review_tag_id );

  // for each tag, find matching field and option in FormSchema

  eventTagLegacyIds.forEach( legacyTagId => {

    let matching = _extractMatchingOption( formSchema, legacyTagId );

    if ( !clean[ matching.field ] ) clean[ matching.field ] = [];

    clean[ matching.field ].push( matching.id );

  } );

  return clean;

}

async function _fetchCustomData( formSchema, agendaId, eventId ) {

  let clean = {};

  let customData, agendaCustomFields;

  try {

    customData = await client( config.legacy.schemas.event )

      .first( 'custom_fields' )

      .where( { id: eventId } )

      .then( row => row ? row.custom_fields : null )

      .then( cf => cf ? JSON.parse( cf ) : null );

    agendaCustomFields = await client( config.legacy.schemas.agenda )

      .first( 'store' )

      .where( { id: agendaId } )

      .then( row => row ? row.store : null )

      .then( store => store ? JSON.parse( store ) : null )

      .then( store => store ? store.customFields : null );

  } catch( e ) {

    throw new VError( e, 'Could not parse custom field data of event of id %s', eventId );

  }

  if ( !customData ) {

    return {};

  }

  _.keys( customData ).forEach( fieldName => {

    let csField = agendaCustomFields.filter( f => f.name === fieldName );

    let fsField = formSchema.fields.filter( f => f.field === fieldName );

    if ( !fsField.length || !csField.length ) {

      return;

    }

    fsField = fsField[ 0 ];
    csField = csField[ 0 ];



    if ( [ 'radio', 'multichoice' ].includes( csField.fieldType ) ) {

      let matchingOption = _extractMatchingOption( formSchema, customData[ fieldName ], 'value' );

      if ( !matchingOption ) {

        throw new Error( 'No matching option was found for legacy field %s of agenda %s on event %s for value %s', fieldName, agendaId, eventId, customData[ fieldName ] );

      }

      clean[ matchingOption.field ] = matchingOption.id;

    } else if ( csField.fieldType === 'checkbox' ) {

      clean[ fieldName ] = !!customData[ fieldName ] ? fsField.options[ 0 ].id : null;

    } else if ( csField.fieldType === 'integer' ) {

      clean[ fieldName ] = parseInt( customData[ fieldName ] );

    } else {

      clean[ fieldName ] = customData[ fieldName ];

    }

  } );

  return clean;

}


function _extractMatchingOption( formSchema, legacyIdentifier, optionField = 'legacyId' ) {

  let matching = formSchema.fields.filter( field => field.options )

    .map( f => {

      let matchingIds = f.options.filter( o => o[ optionField ] === legacyIdentifier )

        .map( o => o.id );

      return matchingIds.length ? { field: f.field, id: matchingIds[ 0 ] } : null;

    } )

    .filter( f => f );

  if ( !matching.length ) {

    throw new Error( 'There is no matching option for legacy identifier %s', legacyIdentifier );

  }

  return matching[ 0 ];

}


module.exports.init = ( c, s, l, cli ) => {

  config = c;

  service = s;

  client = cli;

  legacy = l;

}
