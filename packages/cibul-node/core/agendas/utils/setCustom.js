"use strict";

const _ = require( 'lodash' );

const custom = require( '@openagenda/custom' );

module.exports = async ( formSchemaId, eventUid, data, { agendaId, partial } ) => {

  const result = {
    errors: []
  };

  try {

    const options = {
      context: { legacy: false },
      validate: false,
      partial
    }

    if ( agendaId ) options.agendaId = agendaId;

    _.assign( result, await custom( formSchemaId ).set( eventUid, data, options ) );

  } catch( errors ) {

    result.errors = errors;

  }

  return result;

}
