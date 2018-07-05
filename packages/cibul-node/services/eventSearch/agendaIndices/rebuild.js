"use strict";

const _ = require( 'lodash' );
const agendas = require( '@openagenda/agendas' );
const assemble = require( './assemble' );
const formSchemas = require( '@openagenda/form-schemas' );
const schema = require( '@openagenda/validators/schema' );
const agendaEvents = require( '@openagenda/agenda-events' );

schema.register( {
  integer: require( '@openagenda/validators/integer' )
} );

module.exports = async ( searchIndex, uid ) => {

  const agenda = await _getAgenda( uid );

  const validators = {
    state: schema( {
      code: {
        type: 'integer',
        default: 0
      },
      featured: {
        type: 'boolean',
        default: false
      }
    } )
  }, 

    extensions = {
      state: {
        code: {
          type: 'integer'
        }
      },
      featured: {
        type: 'boolean'
      }
    };

  if ( agenda.formSchemaId ) {

    _.extend( validators, await assemble.getCustomValidators( agenda.formSchemaId ) );

    // required for index mapping
    _.extend( extensions, {
      custom: validators.custom ? validators.custom.fields : null,
      customAdministrator: validators.customAdministrator ? validators.customAdministrator.fields : null,
      customModerator: validators.customModerator ? validators.customModerator.fields : null
    } );

  }

  // track which events could not be assembled
  let missingEvents = [];

  return searchIndex.rebuild( {
    eventsList: async ( offset, limit ) => {

      const aes = await agendaEvents( uid ).list( offset, limit ).then( r => r.items );

      return assemble.list( aes, agenda.formSchemaId, validators ).then( ( { assembled, missing } ) => {

        missingEvents = missingEvents.concat( missing );

        return assembled;

      } );

    },
    extensions
  } ).then( result => {

    return _.extend( result, {
      missingEvents
    } );

  } );

}

function _getAgenda( agendaUid ) {

  return new Promise( ( rs, rj ) => {

    agendas.get( { uid: agendaUid }, { internal: true, private: null }, ( err, agenda ) => {

      if ( err ) return rj( err );

      rs( agenda );

    } );

  } );

}