"use strict";

const _ = require( 'lodash' );

const get = require( './get' );
const legacyTransfer = require( './legacyTransfer' );
const validate = require( '../iso/validate' );
const validateOptions = require( './lib/validateOptions' );

let config, knex;

module.exports = _.extend( create, {
  init: ( c, k ) => {

    config = c;

    knex = k;

  }
} );

async function create( agendaUid, eventUid, data = {}, options = {} ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  let params = validateOptions( options ),

    clean,

    insertIds,

    success = false,

    created = null;

  try {

    let values = _.extend( { eventUid, agendaUid }, data || {}, {
      createdAt: new Date(),
      updatedAt: new Date()
    } );

    if ( !params.protected ) {

      [ 'updatedAt', 'createdAt' ].forEach( f => {

        if ( data[ f ] ) values[ f ] = data[ f ];

      } );

    }

    clean = validate( values );

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

  success = insertIds.length === 1;

  if ( success ) {

    created = await get( clean.agendaUid, clean.eventUid );

  }

  if ( success && config.interfaces.onCreate ) {

    config.interfaces.onCreate( created, params.context );

  }

  if ( success && options.transferToLegacy ) {

    await legacyTransfer.to( created );

  }

  return {
    success,
    insertId: insertIds.length ? insertIds[ 0 ] : null,
    created
  }

}