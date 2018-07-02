"use strict";

const _ = require( 'lodash' );

//const serviceSet = require( '../set' );
const serviceRemove = require( '../remove' );

const categories = require( './categories' );
const customFields = require( './customFields' );
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

  await customFields( eventId,
    fields.filter( f => f.origin === 'custom' ), data );

  await tags( agendaEventId, fields.filter( f => f.origin === 'tags' ), data );

  await categories( agendaEventId, fields.filter( f => f.origin === 'categories' ), data );

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