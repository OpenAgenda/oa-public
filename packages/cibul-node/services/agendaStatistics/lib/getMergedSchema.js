"use strict";

const formSchemas = require( '@openagenda/form-schemas' );
const mergeSchemas = require( '@openagenda/form-schemas/iso/merge' );
const networks = require( '@openagenda/networks' );

module.exports = async agenda => {

  const { networkUid, formSchemaId } = agenda;

  const network = networkUid ? await networks.get( networkUid ) : null;

  return mergeSchemas(
    network && network.formSchemaId ? await formSchemas.get( network.formSchemaId ) : null,
    formSchemaId ? await formSchemas.get( formSchemaId ) : null
  );

}
