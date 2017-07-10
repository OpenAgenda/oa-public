"use strict";

const config = require( './config' );

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
  
  if ( await get( formSchemaId, identifier ) ) {

    throw new Error( 'entry already exists for %s / %s', formSchemaId, identifier );

  }


  // insert
  
  let insertId = await knex( schemas.

}