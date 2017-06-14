"use strict";

const _ = require( 'lodash' ),

  validate = require( '../iso/validate' ),

  get = require( './get' );

let config, knex;

module.exports = _.extend( create, {
  init: ( c, k ) => { config = c; knex = k; }
} );

async function create( agendaUid, eventUid, data ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  let clean,

    insertIds;

  try {

    clean = validate( _.extend( { eventUid, agendaUid }, data || {}, {
      createdAt: new Date(),
      updatedAt: new Date()
    } ) );

  } catch ( validationErrors ) {

    return {
      success: false,
      valid: false,
      errors: validationErrors
    }

  }

  if ( await get( agendaUid, eventUid ) ) {

    return {
      success: false,
      valid: true,
      code: 'already.exists'
    }

  }

  insertIds = await knex( config.schemas.agendaEvent )

    .insert( _.mapKeys( clean, ( v, k ) => _.snakeCase( k ) ) );

  return {
    success: insertIds.length === 1,
    insertId: insertIds.length ? insertIds[ 0 ] : null,
    reference: clean
  }

}