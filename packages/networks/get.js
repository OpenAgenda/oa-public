"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const config = require( './config' );

module.exports = async function get( uid ) {

  if ( !config.knex ) throw new VError( 'service is not initialized' );

  const fetched = await config.knex( config.schema ).first( [ 
    'form_schema_id', 'title'
  ] ).where( 'uid', uid );

  if ( !fetched ) return null;

  return _.assign( { uid }, _.mapKeys( fetched, ( v, k ) => _.camelCase( k ) ) );

}
