"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

module.exports = async function( { knex, schema } ) {

  if ( !knex ) throw new VError( 'service is not initialized' );

  return (
    await knex( schema )
  ).map( n => _.mapKeys( n, ( v, k ) => _.camelCase( k ) ) );

}
