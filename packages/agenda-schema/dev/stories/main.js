"use strict";

const ih = require( 'immutability-helper' );

const storyDefaults = require( './defaults' );

module.exports = {
    interfaces: {
      getAgenda: async ( { slug } ) => storyDefaults.agenda,
      getSchema: async agenda => storyDefaults.schema,
      getSchemaExtensions: async agenda => storyDefaults.schemaExtensions,
      setSchemaFields: storyDefaults.setSchemaFields
    }
  }
