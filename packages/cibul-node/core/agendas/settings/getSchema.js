"use strict";

const _ = require( 'lodash' );

const formSchemas = require( '@openagenda/form-schemas' );

const getAgenda = require( '../utils/getAgenda' );

module.exports = async agendaOrUid => {

  const agenda = _.isObject( agendaOrUid ) ? agendaOrUid : await getAgenda( agendaOrUid );

  return agenda.formSchemaId ? _.assign( { id: agenda.formSchemaId }, await formSchemas.get( agenda.formSchemaId ) ) : null;

}
