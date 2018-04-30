"use strict";

const custom = require( '@openagenda/custom' );
const formSchemas = require( '@openagenda/form-schemas' );
const logger = require( '@openagenda/logger' );

const interfaces = {
  onCreate: require( './onCreate' ),
  onUpdate: require( './onUpdate' ),
  onRemove: require( './onRemove' ),
  getValidator: formSchemas.getValidator
}

module.exports.init = config => {

  custom.init( {
    logger,
    knex: config.knex,
    schemas: {
      custom: 'custom'
    },
    interfaces,
    legacy: {
      schemas: {
        event: config.schemas.event,
        agendaEvent: config.schemas.agendaEvent,
        agendaEventTag: config.schemas.agendaEventTag,
        agenda: config.schemas.agenda
      },
      interfaces: {
        getFormSchemaFields: async formSchemaId => {

          return formSchemas.get( formSchemaId ).then( fs => fs ? fs.fields : [] );

        }
      }
    }
  } );

}