"use strict";

const abilitiesSvc = require( '@openagenda/abilities' );
const app = require( '../../../app' );

const getUnsubscriptionTarget = require( './getUnsubscriptionTarget' );

module.exports = async ( { knex }, entity, action, subject, conditions, fields ) => {
  const usersSvc = app.service( '/users' );
  const target = getUnsubscriptionTarget( entity );

  if ( !target ) {
    throw new Error( '`email` or `entityName` plus `identifier` are required for check an unsubscription' );
  }

  // Defined target
  if ( target.identifier ) {
    const ability = await abilitiesSvc.get( target.entityName, target.identifier );

    return !ability.can( action, subject, conditions, fields );
  }

  // User found target
  const user = await usersSvc.findOne( {
    query: {
      email: target.email
    }
  } );

  if ( user ) {
    const ability = await abilitiesSvc.get( 'user', user.uid );

    return !ability.can( action, subject, conditions, fields );
  }

  // Email target
  if ( target.email ) {
    return !!( await knex( 'unsubscribed' )
      .select()
      .first()
      .where( { email: target.email } ) );
  }
}
