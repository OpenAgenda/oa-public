"use strict";

const VError = require( '@openagenda/verror' );

const log = require( '@openagenda/logs' )( 'create' );

const validateOptions = require( './validators/options' );
const config = require( './config' );
const get = require( './get' );
const legacy = require( './legacy' );

module.exports = async ( formSchemaId, identifier, data, options = {} ) => {

  const { knex, schemas, interfaces } = config;

  const cleanOptions = validateOptions( options );

  if ( !knex ) throw new Error( 'db connector needs to be specified at service init' );

  if ( !interfaces || !interfaces.getValidator ) {

    throw new Error( 'getValidator interface is required at service init' );

  }

  let clean = data;

  if ( cleanOptions.validate ) {

    const validate = await interfaces.getValidator( formSchemaId, cleanOptions );

    try {

      clean = validate( data );

    } catch ( validationErrors ) {

      return {
        success: false,
        valid: false,
        errors: validationErrors
      }

    }

  }

  // verify pre-existing

  if ( await get( formSchemaId, identifier ) ) {

    throw new VError( 'entry already exists for %s / %s', formSchemaId, identifier );

  }


  // insert

  try {

    log( 'info', 'creating custom entry with %j', clean, { formSchemaId, identifier } );

    let insertId = await knex( schemas.custom ).insert( {
      form_schema_id: formSchemaId,
      identifier,
      created_at: new Date(),
      updated_at: new Date(),
      store: JSON.stringify( clean )
    } );

    if ( cleanOptions.transferToLegacy ) {

      log( 'info', 'transfering to legacy' );

      try {

        await legacy( formSchemaId, identifier, clean, cleanOptions );

      } catch ( e ) {

        log( 'error', 'did not sync legacy on create %s.%s', formSchemaId, identifier, e );

      }

    }

    const created = await get( formSchemaId, identifier );

    if ( interfaces.onCreate ) {

      log( 'info', 'calling onCreate' );

      interfaces.onCreate( created, cleanOptions ); // context is same as options here

    }

    log( 'info', 'create successful' );

    return {
      success: true,
      insertId,
      custom: created
    }

  } catch ( e ) {

    log( 'error', e );

    throw new VError( e, 'could not insert for %s / %s', formSchemaId, identifier );

  }

}
