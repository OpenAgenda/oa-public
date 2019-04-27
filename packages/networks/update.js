"use strict";

const _ = require( 'lodash' );
const validate = require( './validate' );
const get = require( './get' );

const updatableFields = [ 'title', 'formSchemaId' ];

module.exports = async function( { knex, schema, patch }, uid, data ) {

  const current = await get( { knex, schema }, uid );

  if ( !current ) throw new Error( 'no network was found for update' );

  const fields = updatableFields.filter( f => _.get( data, f ) !== undefined || !patch );

  const clean = _.assign( validate.part( fields, data ), {
    updatedAt: new Date()
  } );

  await knex( schema )
    .update( _.mapKeys( clean, ( v, k ) => _.snakeCase( k ) ) )
    .where( 'uid', current.uid );

  return _.assign( current, clean );

}
