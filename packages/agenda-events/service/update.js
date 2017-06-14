"use strict";

const _ = require( 'lodash' ),

  validate = require( '../iso/validate' ),

  get = require( './get' );

let config, knex;

module.exports = _.extend( update, {
  init: ( c, k ) => { config = c; knex = k; }
} );

async function update( agendaUid, eventUid, data ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  let clean, result, entryValues,

    current = await get( agendaUid, eventUid );

  if ( current === null ) {

    return {
      success: false,
      code: 'not_found'
    }

  }

  try {

    clean = validate( _.extend( current, data || {}, {
      updatedAt: new Date(),
      createdAt: current.createdAt
    } ) );

  } catch ( validationErrors ) {

    return {
      success: false,
      valid: false,
      errors: validationErrors
    }

  }

  entryValues = _.mapKeys( _.omit( clean,  [ 'createdAt', 'agendaUid', 'eventUid' ] ), ( v, k ) => _.snakeCase( k ) );

  result = await knex( config.schemas.agendaEvent )

    .update( entryValues )

    .where( {
      agenda_uid: agendaUid,
      event_uid: eventUid
    } );

  return {
    success: !!result,
    reference: clean
  }

}