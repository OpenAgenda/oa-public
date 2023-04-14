"use strict";

const VError = require( '@openagenda/verror' );

const log = require( '@openagenda/logs' )( 'get' );

const config = require( './config' );

module.exports = async ( formSchemaId, identifier ) => {

  const { knex, schemas } = config;

  if ( !knex ) throw new Error( 'db connector needs to be specified at service init' );

  log( 'info', 'getting %s.%s', formSchemaId, identifier );

  let data = await knex( schemas.custom ).first().where( {
    form_schema_id: formSchemaId,
    identifier
  } );

  if ( !data ) return null;

  try {

    return JSON.parse( data.store );

  } catch( e ) {

    throw new VError( e, 'could not parse custom data record %s: %s', formSchemaId, identifier );

  }

}
