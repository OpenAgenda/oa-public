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

  const formSchema =  await ( formSchemaId ? formSchemas.get( formSchemaId ) : formSchemas.legacy.transfer( agendaId ) );

  const networkSchema = network ? await formSchemas.get( _.get( network, 'formSchemaId' ) ) : null

  return mergeSchemas( formSchema, networkSchema );

}
