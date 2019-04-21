"use strict";

const _ = require( 'lodash' );
const validate = require( './validate' );
const get = require( './get' );

module.exports = async function( { knex, schema }, uid, data ) {

  const current = await get( { knex, schema }, uid );

  if ( !current ) throw new Error( 'no network was found for update' );

  const clean = _.assign( validate.part( [ 'title' ], data ), {
    updatedAt: new Date()
  } );

  await knex( schema )
    .update( _.mapKeys( clean, ( v, k ) => _.snakeCase( k ) ) )
    .where( 'uid', current.uid );

  return _.assign( current, clean );

}
