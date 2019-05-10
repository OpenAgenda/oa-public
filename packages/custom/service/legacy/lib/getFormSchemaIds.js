"use strict";

module.exports = async ( knex, agendaId ) => {

  const ids = [];

  const {
    agendaFormSchemaId,
    networkUid
  } = await knex( 'review' ).first( [
    'form_schema_id as agendaFormSchemaId',
    'network_uid as networkUid'
  ] ).where( 'id', agendaId );

  if ( agendaFormSchemaId ) ids.push( agendaFormSchemaId );

  if ( networkUid ) {

    const { networkFormSchemaId } = await knex( 'network' )
      .first( [ 'form_schema_id as networkFormSchemaId' ] )
      .where( 'uid', networkUid );

    if ( networkFormSchemaId ) ids.push( networkFormSchemaId );

  }

  return ids;

}
