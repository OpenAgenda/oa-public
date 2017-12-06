"use strict";

const validateOptions = require( './validators/options' );
const config = require( './config' );
const get = require( './get' );
const legacy = require( './legacy' );

const log = require( '@openagenda/logs' )( 'remove' );

module.exports = async ( formSchemaId, identifier, options = {} ) => {

  const { knex, schemas, interfaces } = config;

  const cleanOptions = validateOptions( options );

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

    if ( !!removedCount && cleanOptions.tranferToLegacy ) {

      try {

        await legacy.remove( formSchemaId, identifier );

      } catch ( e ) {

        log( 'error', 'did not sync legacy on remove %s.%s', formSchemaId, identifier, e );

      }

    }

    return {
      success: !!removedCount
    }

  } catch ( e ) {

    throw new VError( e, 'could not remove for %s / %s', formSchemaId, identifier );

  }

}