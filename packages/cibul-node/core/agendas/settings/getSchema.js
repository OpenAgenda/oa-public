"use strict";

const _ = require( 'lodash' );

const formSchemas = require( '@openagenda/form-schemas' );

const getAgenda = require( '../utils/getAgenda' );
const getNetwork = require('../utils/getNetwork');

module.exports = async agendaOrUid => {
  const agenda = _.isObject( agendaOrUid ) ? agendaOrUid : await getAgenda( agendaOrUid );

  return agenda.formSchemaId ? Object.assign( { id: agenda.formSchemaId }, await formSchemas.get( agenda.formSchemaId ) ) : null;
}

module.exports.network = async agendaOrUid => {
  const agenda = _.isObject(agendaOrUid) ? agendaOrUid : await getAgenda(agendaOrUid);
  if (!agenda || !agenda.networkUid) {
    return null;
  }
  const network = await getNetwork(agenda.networkUid);

  return network.formSchemaId ? Object.assign({
    id: network.formSchemaId
  }, await formSchemas.get(network.formSchemaId)) : null;
}
