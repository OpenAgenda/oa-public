"use strict";

const _ = require( 'lodash' );

const customFields = require( './customFields' );
const tags = require( './tags' );
const categories = require( './categories' );
const config = require( '../config' );

module.exports = _.extend( set, {
  remove
} );


async function set( formSchemaId, identifier, data ) {

  const { knex } = config;
  const { schemas, interfaces } = config.legacy;

  const fields = await interfaces.getFormSchemaFields( formSchemaId );

  const { id: agendaId } = await knex( schemas.agenda ).first( 'id' ).where( 'form_schema_id', formSchemaId );

  const { id: eventId } = await knex( schemas.event ).first( 'id' ).where( 'uid', identifier );

  await customFields( eventId,
    fields.filter( f => f.origin === 'custom' ), data );

  const { id: agendaEventId } = await knex( schemas.agendaEvent ).first( 'id' ).where( {
    review_id: agendaId,
    event_id: eventId
  } );

  await tags( agendaEventId, fields.filter( f => f.origin === 'tags' ), data );

  await categories( agendaEventId, fields.filter( f => f.origin === 'categories' ), data );

}

async function remove( formSchemaId, identifier ) {

  const { knex } = config;
  const { schemas, interfaces } = config.legacy;

  const { id: agendaId } = await knex( schemas.agenda ).first( 'id' ).where( 'form_schema_id', formSchemaId );

  const { id: eventId } = await knex( schemas.event ).first( 'id' ).where( 'uid', identifier );

  await knex( schemas.agendaEvent ).delete().where( {
    review_id: agendaId,
    event_id: eventId
  } );

}