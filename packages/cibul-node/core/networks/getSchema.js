"use strict";

const formSchemas = require( '@openagenda/form-schemas' );
const get = require( './get' );

module.exports = async networkUid => {

  const network = await get( networkUid );

  if ( !network ) throw new Error( 'no network was found' );

  return formSchemas.get( network.formSchemaId );

}
