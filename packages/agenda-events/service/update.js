"use strict";

const _ = require( 'lodash' ),

  validate = require( '../iso/validate' ),

  get = require( './get' ),

  validateOptions = require( './lib/validateOptions' );

let config, knex;

module.exports = _.extend( update, {
  init: ( c, k ) => { config = c; knex = k; }
} );

async function update( agendaUid, eventUid, data, options = {} ) {

  if ( !knex ) throw new VError( 'agenda-events service is not configured' );

  let params = validateOptions( options ),

    clean, result, entryValues,

    current = await get( agendaUid, eventUid ),

    success = false,

    updated = null;

  if ( current === null ) {

    return {
      success,
      code: 'not_found'
    }

  }

  try {

    let values = _.extend( current, data || {}, {
      updatedAt: new Date(),
      createdAt: current.createdAt
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

  entryValues = _.mapKeys( _.omit( clean, [ 'agendaUid', 'eventUid' ] ), ( v, k ) => _.snakeCase( k ) );

  result = await knex( config.schemas.agendaEvent )

    .update( entryValues )

    .where( {
      agenda_uid: agendaUid,
      event_uid: eventUid
    } );

  success = !!result;

  if ( success ) {

    updated = await get( clean.agendaUid, clean.eventUid );

  }

  if ( success && config.interfaces.onUpdate ) {

    config.interfaces.onUpdate( current, updated, params.context );

  }

  return {
    success,
    updated
  }

}