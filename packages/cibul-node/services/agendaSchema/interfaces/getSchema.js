"use strict";

const _ = require( 'lodash' );
const formSchemas = require( '@openagenda/form-schemas' );

const log = require( '@openagenda/logs' )( 'events/interfaces/getSchemas' );

module.exports = async agenda => {

  log( 'info', agenda.formSchemaId ? 'agenda schema is loaded' : 'no agenda schema is defined' );

  return agenda.formSchemaId ? await formSchemas.get( agenda.formSchemaId ) : null;

}
