"use strict";

const formSchemas = require( '@openagenda/form-schemas' );

module.exports.init = config => {

  formSchemas.init( {
    knex: config.knex,
    tmpFolder: config.tmpFolderPath,
    schemas: {
      formSchema: 'form_schema'
    },
    legacy: {
      knex: config.knex,
      schemas: config.schemas
    },
    logger: {
      debug: {
        prefix: 'form-schemas:'
      },
      token: null
    }
  } );

}
