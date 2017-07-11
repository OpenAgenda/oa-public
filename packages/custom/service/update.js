"use strict";

const config = require( './config' );

const get = require( './get' );

module.exports = async ( formSchemaId, identifier, data ) => {

  const { knex, schemas, interfaces } = config;

  if ( !knex ) throw new Error( 'db connector needs to be specified at service init' );

  if ( !interfaces || !interfaces.getValidator ) {

    throw new Error( 'getValidator interface is required at service init' );

  }

  const validate = await interfaces.getValidator( formSchemaId );

  // clean

  let clean;

  try {

    clean = validate( data );

  } catch ( validationErrors ) {

    return {
      success: false,
      valid: false,
      errors: validationErrors
    }

  }


  // verify pre-existing
  
  if ( !await get( formSchemaId, identifier ) ) {

    throw new Error( 'entry was not found for %s / %s', formSchemaId, identifier );

  }


  // update
  
  try {

    let updated = !!( await knex( schemas.custom ).update( {
      updated_at: new Date(),
      store: JSON.stringify( clean )
    } )

    .where( {
      form_schema_id: formSchemaId,
      identifier,
    } ) );

    return {
      success: true,
      custom: clean
    }

  } catch ( e ) {

    throw new VError( e, 'could not update for %s / %s', formSchemaId, identifier );

  }

}