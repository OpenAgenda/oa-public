"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

module.exports = async function get( { knex, schema }, uid ) {

  if ( !knex ) throw new VError( 'service is not initialized' );

  const fetched = await knex( schema ).first( [
    'form_schema_id', 'title'
  ] ).where( 'uid', uid );

  if ( !fetched ) return null;

  return _.assign( { uid }, _.mapKeys( fetched, ( v, k ) => _.camelCase( k ) ) );

}
