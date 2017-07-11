"use strict";

const config = require( './config' );

const VError = require( 'verror' );

module.exports = async ( formSchemaId, offset, limit ) => {

  return {
    items: await _base( formSchemaId ).select( [ 'store' ] ).limit( limit ).offset( offset ).map( r => JSON.parse( r.store ) ),
    total: await _base( formSchemaId ).count( 'identifier as total' ).then( r => r[ 0 ].total )
  }

}


function _base( formSchemaId ) {

  if ( !config.knex ) throw new Error( 'db connector needs to be specified at service init' );

  return config.knex( config.schemas.custom ).where( 'form_schema_id', formSchemaId );

}