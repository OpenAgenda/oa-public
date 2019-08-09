"use strict";

const _ = require( 'lodash' );
const log = require( '@openagenda/logs' )( 'patch' );

const get = require( './get' );
const validate = require( './lib/validate' );
const cleanPatchOptions = require( './lib/cleanPatchOptions' );
const { toDB } = require( './lib/transformDBEntry' );

module.exports = async ( config, identifiers, data, options = {} ) => {
  log( 'processing', data );

  const { knex, schema, interfaces } = config;

  const {
    requireCustom,
    context
  } = cleanPatchOptions( options );

  const clean = {};

  const member = await get( config, identifiers, { legacy: true } );

  if ( !member ) throw new Error( 'Not found' );

  try {
    Object.assign(
      clean,
      validate.withCustom( requireCustom ).part( _.keys( data ), data ),
      { updatedAt: new Date }
    );
  } catch ( errors ) {
    return {
      success: false,
      errors
    }
  }

  if ( clean.userUid !== undefined && interfaces.getUsersByUid ) {
    clean.userId = _.get(
      await interfaces.getUsersByUid( clean.userUid ),
      '0.id'
    );
  }

  if ( clean.agendaUid !== undefined && interfaces.getAgendasByUid ) {
    clean.agendaId = _.get(
      await interfaces.getAgendasByUid( clean.agendaUid ),
      '0.id'
    );
  }

  log( 'patching', clean );

  await knex( schema )
    .update( toDB( clean ) )
    .where( 'id', member.id );

  const patched = await get( config, member.id, { legacy: true } );

  if ( _.get( interfaces, 'onPatch' ) ) {
    try {
      await interfaces.onPatch( member, patched, context );
    } catch ( e ) {
      log( 'error', 'interface onPatch exception for member %s', member.id, e );
    }
  }

  return {
    success: true,
    errors: [],
    member: patched
  }
}
