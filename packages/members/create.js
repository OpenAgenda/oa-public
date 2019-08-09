"use strict";

const _ = require( 'lodash' );
const validate = require( './lib/validate' );
const cleanCreateOptions = require( './lib/cleanCreateOptions' );
const { toDB } = require( './lib/transformDBEntry' );

const log = require( '@openagenda/logs' )( 'create' );

module.exports = async ( { knex, schema, interfaces }, data, options = {} )  => {
  log( 'processing', data );

  const {
    requireCustom,
    context
  } = cleanCreateOptions( options );

  const clean = {};

  try {
    Object.assign(
      clean,
      validate.withCustom( requireCustom )( data ),
      { createdAt: new Date, updatedAt: new Date }
    );
  } catch ( errors ) {
    return {
      success: false,
      errors
    }
  }

  if ( clean.agendaUid && interfaces.getAgendasByUid ) {
    clean.agendaId = _.get(
      await interfaces.getAgendasByUid( clean.agendaUid ),
      '0.id'
    );
  }

  if ( clean.userUid && interfaces.getUsersByUid ) {
    clean.userId = _.get(
      await interfaces.getUsersByUid( clean.userUid ),
      '0.id'
    );
  }

  clean.invited = !clean.userUid;

  if ( clean.userUid && clean.agendaUid ) {
    if ( !!(
      await knex( schema )
        .first( 'id' )
        .where( 'user_uid', clean.userUid )
        .where( 'agenda_uid', clean.agendaUid )
    ) ) {
      throw new Error( 'Already exists' );
    }
  }

  log( 'inserting member', clean );

  clean.id = _.first(
    await knex( schema ).insert( toDB( clean ) )
  );

  if ( _.get( interfaces, 'onCreate' ) ) {
    try {
      await interfaces.onCreate( clean, context );
    } catch ( e ) {
      log( 'error', 'interface onCreate exception for member %s', clean.id, e );
    }
  }

  return {
    errors: [],
    success: true,
    member: clean
  }
}
