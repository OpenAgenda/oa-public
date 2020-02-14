"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );

const getNetwork = require( './getNetwork' );
const getSchemas = require( './getSchemas' );

module.exports = async (services, agendaUid) => {

  const {
    agendas,
    formSchemas
  } = services;

  const agenda = await agendas.get( { uid: agendaUid }, {
    internal: true,
    private: null,
    includeImagePath: true
  } );

  if ( !agenda ) {

    throw new VError( 'agenda of uid %d was not found', agendaUid );

  }

  agenda.network = await getNetwork( agenda.networkUid );

  const [
    formSchema,
    networkSchema
  ] = await getSchemas( [
    agenda.formSchemaId,
    _.get( agenda, 'network.formSchemaId' )
  ] );

  if ( formSchema ) agenda.formSchema = formSchema;

  if ( networkSchema ) agenda.network.formSchema = networkSchema;

  return agenda;

}
