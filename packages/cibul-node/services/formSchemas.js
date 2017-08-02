"use strict";

const formSchemas = require( 'form-schemas' );

module.exports.init = config => {

  formSchemas.init( {
    knex: config.knex,
    schemas: {
      formSchema: 'form_schema'
    },
    legacy: {
      knex: config.knex,
      schemas: config.schemas
    }
  } );

}