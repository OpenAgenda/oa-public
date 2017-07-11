"use strict";

const config = require( './config' );

const get = require( './get' );

module.exports = async ( formSchemaId, identifier ) => {

  const { knex, schemas, interfaces } = config;

  if ( !knex ) throw new Error( 'db connector needs to be specified at service init' );

  // verify pre-existing
  
  if ( !await get( formSchemaId, identifier ) ) {

    throw new Error( 'entry was not found for %s / %s', formSchemaId, identifier );

  }


  // remove
  
  try {

    let removedCount = await knex( schemas.custom ).del()

      .where( {
        form_schema_id: formSchemaId,
        identifier,
      } );

    return {
      success: !!removedCount
    }

  } catch ( e ) {

    throw new VError( e, 'could not remove for %s / %s', formSchemaId, identifier );

  }

}