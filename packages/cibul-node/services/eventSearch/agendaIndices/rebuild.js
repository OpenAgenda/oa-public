"use strict";

const agendaEvents = require( 'agenda-events' );

const assemble = require( './assemble' );

const _ = require( 'lodash' );

const formSchemas = require( 'form-schemas' );

const agendas = require( 'agendas' );

module.exports = async ( searchIndex, uid ) => {

  const agenda = await _getAgenda( uid );

  const validators = {}, extensions = {};

  if ( agenda.formSchemaId ) {

    _.extend( validators, await assemble.getCustomValidators( agenda.formSchemaId ) );

    // required for index mapping
    _.extend( extensions, {
      custom: validators.custom ? validators.custom.fields : null,
      customAdministrator: validators.customAdministrator ? validators.customAdministrator.fields : null,
      customModerator: validators.customModerator ? validators.customModerator.fields : null
    } )

  }

  return searchIndex.rebuild( {
    eventsList: async function( offset, limit ) {

      const aes = await agendaEvents( uid ).list( offset, limit ).then( r => r.items );

      return assemble.list( aes, agenda.formSchemaId, validators );

    },
    extensions
  } );

}

function _getAgenda( agendaUid ) {

  return new Promise( ( rs, rj ) => {

    agendas.get( { uid: agendaUid }, { internal: true }, ( err, agenda ) => {

      if ( err ) return rj( err );

      rs( agenda );

    } );

  } );

}