"use strict";

const custom = require( '@openagenda/custom' );
const formSchemas = require( '@openagenda/form-schemas' );

const interfaces = {
  onCreate: require( './onCreate' ),
  onUpdate: require( './onUpdate' ),
  onRemove: require( './onRemove' ),
  getValidator: formSchemas.getValidator
}

module.exports.init = config => {
  custom.init( {
    logger: config.getLogConfig( 'svc', 'custom' ),
    knex: config.knex,
    schemas: {
      custom: 'custom'
    },
    interfaces,
    queue: {
      redis: config.redis,
      name: 'custom'
    },
    legacy: {
      schemas: {
        event: config.schemas.event,
        agendaEvent: config.schemas.agendaEvent,
        agendaEventTag: config.schemas.agendaEventTag,
        agenda: config.schemas.agenda,
        agendaCategory: config.schemas.agendaCategory,
        agendaTag: config.schemas.agendaTag
      },
      interfaces: {
        getFormSchemaFields: async formSchemaId => {

          return formSchemas.get( formSchemaId ).then( fs => fs ? fs.fields : [] );

        }
      }
    }
  } );

  return custom;
}
