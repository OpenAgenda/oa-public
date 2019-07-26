"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'legacy' );

const config = require( '../config' );
const set = require( './set' );
const setAll = require( './setAll' );

module.exports = _.extend( set, {
  remove,
  setAll: setAll.bind( null, config )
} );

async function remove( formSchemaId, identifier ) {

  const { knex } = config;
  const { schemas, interfaces } = config.legacy;

  const { id: agendaId } = await knex( schemas.agenda ).first( 'id' ).where( 'form_schema_id', formSchemaId );

  const { id: eventId } = await knex( schemas.event ).first( 'id' ).where( 'uid', identifier );

  await knex( schemas.agendaEvent ).delete().where( {
    review_id: agendaId,
    event_id: eventId
  } );

}
