"use strict";

const log = require( '@openagenda/logs' )( 'set' );

const get = require( './get' );

const operations = {
  create: require( './create' ),
  update: require( './update' )
}

const config = require( './config' );

module.exports = async ( formSchemaId, identifier, data, options = {} ) => {

  const { knex, schemas, interfaces } = config;

  const operation = ( await get( formSchemaId, identifier ) ) ? 'update' : 'create';

  const result = await operations[ operation ]( formSchemaId, identifier, data, options );

  result.operation = operation;

  return result;

}