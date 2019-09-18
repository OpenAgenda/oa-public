"use strict";

const _ = require( 'lodash' );

const VError = require( 'verror' );
const validateOptions = require( './validators/options' );
const config = require( './config' );
const get = require( './get' );
const legacy = require( './legacy' );

const log = require( '@openagenda/logs' )( 'update' );

module.exports = async ( formSchemaId, identifier, data, options = {} ) => {

  const { knex, schemas, interfaces } = config;

  const cleanOptions = validateOptions( options );

  if ( !knex ) throw new Error( 'db connector needs to be specified at service init' );

  if ( !interfaces || !interfaces.getValidator ) {

    throw new Error( 'getValidator interface is required at service init' );

  }

  // verify pre-existing

  const before = cleanOptions.preloaded || await get( formSchemaId, identifier );

  if ( !before ) {

    throw new VError( 'entry was not found for %s / %s', formSchemaId, identifier );

  }

  let clean = data;

  if ( cleanOptions.validate ) {

    const validate = await interfaces.getValidator( formSchemaId );

    // clean

    try {

      clean = cleanOptions.partial ? validate.part( _.keys( data ), data ) : validate( data );

    } catch ( validationErrors ) {

      return {
        success: false,
        valid: false,
        errors: validationErrors
      }

    }

  }


  // update

  try {

    const completeClean = cleanOptions.partial ? _.assign( {}, before, clean ) : clean;

    let updated = !!( await knex( schemas.custom ).update( {
      updated_at: new Date(),
      store: JSON.stringify( completeClean )
    } )

    .where( {
      form_schema_id: formSchemaId,
      identifier,
    } ) );

    if ( cleanOptions.transferToLegacy ) {

      try {

        await legacy( formSchemaId, identifier, completeClean, cleanOptions );

      } catch ( e ) {

        log( 'error', 'did not sync legacy on update %s.%s', formSchemaId, identifier, e );

      }

    }

    if ( updated && interfaces.onUpdate ) {

      interfaces.onUpdate( before, await get( formSchemaId, identifier ), cleanOptions );

    }

    return {
      success: true,
      custom: completeClean,
      before
    }

  } catch ( e ) {

    throw new VError( e, 'could not update for %s / %s', formSchemaId, identifier );

  }

}
