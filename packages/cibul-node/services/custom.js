"use strict";

const custom = require( '@openagenda/custom' );

const formSchemas = require( '@openagenda/form-schemas' );

module.exports.init = config => {

  custom.init( {
    knex: config.knex,
    schemas: {
      custom: 'custom'
    },
    interfaces: {
      getValidator: formSchemas.getValidator
    }
  } );

}