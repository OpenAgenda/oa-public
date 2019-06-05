"use strict";

const parseCustomFields = require( './parseCustomFields' ),

  parseTagSet = require( './parseTagSet' ),

  knex = require( 'knex' ),

  _ = require( 'lodash' ),

  VError = require( 'verror' ),

  agendaEventGet = require( './agendaEventGet' );

let config, client, service;

module.exports = {
  get,
  transfer,
  agendaEventGet,
  shutdown,
  init
}


async function get( agendaId ) {

  let customFields, tagSet, categorySet, networkFormSchemaId, networkFormSchema, formData = {
    fields: []
  };

  const networkUid = await client( config.legacy.schemas.agenda )
    .first( 'network_uid' )
    .where( 'id', agendaId )
    .then( r => r ? r.network_uid : null );

  if ( networkUid ) {
    networkFormSchemaId = await client( config.schemas.network )
      .first( 'form_schema_id' )
      .where( 'uid', networkUid )
      .then( r => r ? r.form_schema_id : null );
  }

  if ( networkFormSchemaId ) {
    networkFormSchema = await client( config.schemas.formSchema )
      .first( 'store' )
      .where( 'id', networkFormSchemaId )
      .then( r => r ? r.store : null );

    networkFormSchema = networkFormSchema ? JSON.parse( networkFormSchema ) : null;
  }

  await client( config.schemas.network ).first( 'form_schema_id' ).where

  try {

    customFields = await _queryStore( config.legacy.schemas.agenda, agendaId, 'customFields' );

    if ( customFields ) formData = parseCustomFields( formData, customFields );

  } catch( e ) {

    console.log( e );

    throw new VError( e, 'could not parse legacy custom fields for agenda of id %s', agendaId );

  }

  try {

    tagSet = await _queryStore( config.legacy.schemas.tagSet, agendaId );

    if ( tagSet ) {
      formData = parseTagSet( formData, tagSet );
    }

  } catch( e ) {

    throw new VError( e, 'could not parse legacy tag set for agenda of id %s', agendaId );

  }

  try {

    categorySet = await _queryStore( config.legacy.schemas.categorySet, agendaId );

    if ( categorySet && categorySet.categories.length ) {
      formData = parseTagSet.categories( formData, categorySet );
    }

  } catch( e ) {

    throw new VError( e, 'could not parse legacy category set for agenda of id %s', agendaId );

  }

  if ( networkFormSchema ) {
    formData.fields.forEach( ( f, i ) => {
      formData.fields[ i ].network = networkFormSchema.fields.map( f => f.field ).indexOf( f.field ) !== -1
    } );
  }

  return formData.fields.length ? formData : null;

}

async function transfer( agendaId ) {

  let formSchema, // rebuilt formSchema from legacy data

    agenda,// agenda reference

    result, // creation or update result.

    operation; // type of the transfer operation: create or update

  if ( !client ) {

    throw new Error( 'database client not initialized' );

  }

  agenda = await client( config.legacy.schemas.agenda ).select( [
    'form_schema_id'
  ] )

    .where( { id: agendaId } )

    .then( rows => rows.length ? rows[ 0 ] : null );

  if ( !agenda ) {

    return {
      transfered: false,
      message: 'agenda not found',
      agendaId
    }

  }

  operation = agenda[ 'form_schema_id' ] ? 'update' : 'create';

  formSchema = await get( agendaId );

  formSchema.fields = formSchema.fields.filter( f => !f.network );

  if ( operation === 'update' ) {

    result = await service.update( agenda[ 'form_schema_id' ], formSchema );

  } else {

    result = await service.create( formSchema );

  }

  if ( result.success && operation === 'create' ) {

    await client( config.legacy.schemas.agenda ).update( {
      form_schema_id: result.id
    } ).where( 'id', agendaId );

  }

  return _.extend( {
    transfered: true,
    operation
  }, result );

}

function init( c, svc ) {

  config = c;

  service = svc;

  client = c.legacy.knex || knex( {
    client: 'mysql',
    connection: c.legacy
  } );

  agendaEventGet.init( config, service, {
    transfer, get
  }, client );

}

function shutdown() {

  client.destroy();

}

function _queryStore( schema, id, key ) {

  return client( schema )
    .select( 'store' )
    .where( { id } )
    .limit( 1 )
    .then( rows => rows.length ? rows[ 0 ].store : null )
    .then( storeString => storeString ? JSON.parse( storeString ) : null )
    .then( store => store && key ? store[ key ] : store );

}
