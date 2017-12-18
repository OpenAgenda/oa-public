"use strict";

const formSchemas = require( '@openagenda/form-schemas' );

const getAgenda = require( '../utils/getAgenda' );

module.exports = async agendaUid => {

  const {
    id: agendaId,
    formSchemaId
  } = await getAgenda( agendaUid );

  if ( !formSchemaId ) {

    return formSchemas.legacy.transfer( agendaId );

  } else {

    return formSchemas.get( formSchemaId );

  }

}