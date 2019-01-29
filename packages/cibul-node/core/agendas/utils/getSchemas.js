"use strict";

const VError = require( 'verror' );
const formSchemas = require( '@openagenda/form-schemas' );

module.exports = async ( schemaIds = [] ) => {

  const schemas = [];

  for ( const schemaId of schemaIds ) {

    if ( !schemaId ) {

      schemas.push( null );

      continue;

    }

    const schema = await formSchemas.get( schemaId );

    if ( !schema ) throw new VError( 'Schema of id %s was not found', schemaId );

    schemas.push( schema );

  }

  return schemas;

}
