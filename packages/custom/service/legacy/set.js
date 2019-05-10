"use strict";

const log = require( '@openagenda/logs' )( 'legacy/set' );

const categories = require( './categories' );
const custom = require( './custom' );
const load = require( './load' );
const tags = require( './tags' );

module.exports = async ( formSchemaId, identifier, data, options = {} ) => {

  log( 'info', 'fetching required data for legacy transfer', { formSchemaId, identifier } );

  const {
    fields,
    agendaId,
    eventId,
    agendaEventId
  } = await load( formSchemaId, identifier, {
    insertIfNotExists: true,
    agendaId: options.agendaId
  } );

  if ( !fields.filter( f => !!f.origin ).length ) {

    log( 'warn', 'no origin is defined for fields of schema %s', formSchemaId, { formSchemaId, identifier } );

    return;

  }

  log( 'info', 'transfering legacy custom data', { formSchemaId, identifier } );

  const customFields = fields.filter( f => f.origin === 'custom' );

  if ( !customFields.length ) {

    log( 'info', 'no values are to be transfered to legacy custom' );

  } else {

    try {

      await custom(
        eventId,
        customFields,
        data
      );

    } catch ( e ) {

      log( 'error', 'could not set legacy custom data', e );

    }

  }

  log( 'info', 'transfering legacy tag data', { formSchemaId, identifier } );

  try {

    await tags( agendaEventId, fields.filter( f => f.origin === 'tags' ), data );

  } catch ( e ) {

    log( 'error', 'could not set legacy tags', e );

  }

  log( 'info', 'transfering legacy category data', { formSchemaId, identifier } );

  try {

    await categories( agendaEventId, fields.filter( f => f.origin === 'categories' ), data );

  } catch ( e ) {

    log( 'error', 'could not set legacy category categories', e );

  }

}
