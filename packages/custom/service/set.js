"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'set' );

const get = require( './get' );

const operations = {
  create: require( './create' ),
  update: require( './update' )
}

const config = require( './config' );

module.exports = async ( formSchemaId, identifier, data, options = {} ) => {

  log( 'setting custom data for %s.%s', formSchemaId, identifier );

  const { knex, schemas, interfaces } = config;

  const current = await get( formSchemaId, identifier );

  const operation = current ? 'update' : 'create';

  const result = await operations[ operation ]( formSchemaId, identifier, data, operation === 'create' ? options : _.assign( { preloaded: current }, options ) );

  result.operation = operation;

  return result;

}
