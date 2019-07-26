"use strict";

const _ = require( 'lodash' );

const get = require( './get' );

module.exports = async ( config, identifiers ) => {

  const { knex, schema, interfaces } = config;

  const member = await get( config, identifiers );

  if ( !member ) throw new Error( 'Not found' );

  await knex( schema ).delete().where( 'id', member.id );

  return {
    success: true
  }

}
