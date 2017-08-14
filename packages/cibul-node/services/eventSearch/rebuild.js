"use strict";

const search = require( 'event-search' );

const agendaEvents = require( 'agenda-events' );

const assemble = require( './assemble' );

module.exports = async ( { uid, formSchemaId } ) => {

  const validators = await assemble.getCustomValidators( formSchemaId );

  // required for index mapping
  const extensions = {
    custom: validators.custom ? validators.custom.fields : null,
    customAdministrator: validators.customAdministrator ? validators.customAdministrator.fields : null,
    customModerator: validators.customModerator ? validators.customModerator.fields : null
  }

  return search( `agendas:${uid}` ).rebuild( {
    eventsList: async function( offset, limit ) {

      const aes = await agendaEvents( uid ).list( offset, limit ).then( r => r.items );

      return assemble.list( aes, formSchemaId, validators );

    },
    extensions
  } );

}