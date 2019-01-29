"use strict";

const _ = require( 'lodash' );

const formSchemas = require( '@openagenda/form-schemas' );
const mergeSchemas = require( '@openagenda/form-schemas/iso/merge' );

const getAgenda = require( '../utils/getAgenda' );
const getNetwork = require( '../utils/getNetwork' );

module.exports = async agendaUid => {

  const {
    id: agendaId,
    networkUid,
    formSchemaId
  } = await getAgenda( agendaUid );

  const network = await getNetwork( networkUid );

  const formSchema = await _loadFormSchema( agendaId, formSchemaId, !!_.get( network, 'formSchemaId' ) );

  const networkSchema = network ? await formSchemas.get( _.get( network, 'formSchemaId' ) ) : null;

  // the network should come first.
  return mergeSchemas( networkSchema, formSchema );

}

function _loadFormSchema( agendaId, formSchemaId, hasNetworkSchema = false ) {

  if ( formSchemaId ) return formSchemas.get( formSchemaId );

  if ( hasNetworkSchema ) return null;

  return formSchemas.legacy.transfer( agendaId );

}
