"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'legacy/load' );

const agendaEvents = require( './agendaEvents' );
const config = require( '../config' );

module.exports = async ( formSchemaId, identifier, insertIfNotExists = false ) => {

  log( 'loading legacy data for %s', formSchemaId );

  const { knex } = config;

  const { schemas, interfaces } = config.legacy;

  const fields = await interfaces.getFormSchemaFields( formSchemaId );  

  const { id: agendaId } = await knex( schemas.agenda )
    .first( 'id' ).where( 'form_schema_id', formSchemaId );

  const {
    id: eventId,
    custom_fields: customFieldsStr
  } = await knex( schemas.event )
    .first( [ 'id', 'custom_fields' ] )
    .where( 'uid', identifier );

  log( 'loaded legacy custom data for %s', formSchemaId );

  const {
    id: agendaEventId,
    categoryId
  } = await agendaEvents( agendaId, eventId, insertIfNotExists );

  if ( !agendaEventId ) {

    throw new Error( `Did not find review_article ${agendaId}.${eventId}` );

  }

  log( 'loaded legacy agenda-event reference %s.%s', agendaId, eventId );

  const custom = {};

  try {

    if ( _.isString( customFieldsStr ) && customFieldsStr.length ) {

      _.assign( custom, JSON.parse( customFieldsStr ) );

    }

  } catch( e ) {

    log( 'error', 'could not parse legacy custom fields: %j', customFieldsStr );

  }

  return {
    fields,
    agendaId,
    eventId,
    agendaEventId,
    categoryId,
    custom
  }

}