"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'legacy' );

//const serviceSet = require( '../set' );
const serviceRemove = require( '../remove' );

const categories = require( './categories' );
const custom = require( './custom' );
const config = require( '../config' );
const load = require( './load' );
const tags = require( './tags' );

module.exports = _.extend( set, {
  remove
} );

async function set( formSchemaId, identifier, data ) {

  const {
    fields,
    agendaId,
    eventId,
    agendaEventId
  } = await load( formSchemaId, identifier, { insertIfNotExists: true } );

  try {

    await custom( eventId,
      fields.filter( f => f.origin === 'custom' ), data );

  } catch ( e ) {

    log( 'error', 'could not set legacy custom data', e );

  }

  try {

    await tags( agendaEventId, fields.filter( f => f.origin === 'tags' ), data );

  } catch ( e ) {

    log( 'error', 'could not set legacy tags', e );

  }

  try {

    await categories( agendaEventId, fields.filter( f => f.origin === 'categories' ), data );

  } catch ( e ) {

    log( 'error', 'could not set legacy custom categories', e );

  }

}

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
