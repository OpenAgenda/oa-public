"use strict";

const _ = require( 'lodash' );
const validate = require( './lib/validate' );
const cleanCreateOptions = require( './lib/cleanCreateOptions' );
const { toDB } = require( './lib/transformDBEntry' );

module.exports = async ( { knex, schema, interfaces }, data, options = {} )  => {

  const {
    requireCustom
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
    clean.reviewId = _.get(
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

  clean.id = _.first(
    await knex( schema ).insert( toDB( clean ) )
  );

  return {
    errors: [],
    success: true,
    member: clean
  }

}
