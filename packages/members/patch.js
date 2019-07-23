"use strict";

const _ = require( 'lodash' );

const get = require( './get' );
const validate = require( './lib/validate' );
const cleanUpdateOptions = require( './lib/cleanUpdateOptions' );
const { toDB } = require( './lib/transformDBEntry' );

module.exports = async ( config, identifiers, data, options = {} ) => {

  const { knex, schema, interfaces } = config;

  const {
    requireCustom
  } = cleanUpdateOptions( options );

  const clean = {};

  const member = await get( config, identifiers );

  if ( !member ) throw new Error( 'Not found' );

  try {

    Object.assign(
      clean,
      validate.withCustom( requireCustom ).part( _.keys( data ), data ),
      { updatedAt: new Date }
    );
  } catch ( errors ) {
    return {
      success: false,
      errors
    }
  }

  await knex( schema )
    .update( toDB( clean ) )
    .where( 'id', member.id );

  return {
    success: true,
    errors: [],
    member: { ...member, ...clean }
  }

}
