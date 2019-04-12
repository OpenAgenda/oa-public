"use strict";

const _ = require( 'lodash' );
const formSchemas = require( '@openagenda/form-schemas' );

module.exports.init = config => {

  formSchemas.init( {
    knex: config.knex,
    tmpFolder: config.tmpFolderPath,
    s3: _.pick( config.aws, [
      'accessKeyId',
      'secretAccessKey',
      'region',
      'bucket'
    ] ),
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
