"use strict";

const _ = require( 'lodash' );

const custom = require( '@openagenda/custom' );

module.exports = async ( formSchemaId, eventUid, data, { draft, agendaId } ) => {

  const result = {
    errors: []
  };

  try {

    const options = {
      transferToLegacy: !draft, 
      context: { legacy: false },
      draft
    }

    if ( agendaId ) options.agendaId = agendaId;

    _.assign( result, await custom( formSchemaId ).set( eventUid, data, options ) );

  } catch( errors ) {

    result.errors = errors;

  }

  return result;

}
