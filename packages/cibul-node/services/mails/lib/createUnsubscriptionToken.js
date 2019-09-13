"use strict";

const uuid = require( 'uuid/v4' );

const abilitiesSvc = require( '@openagenda/abilities' );
const log = require( '@openagenda/logs' )( 'services/mails/createUnsubscriptionToken' );

const getUnsubscriptionTarget = require( './getUnsubscriptionTarget' );

module.exports = async ( { schemas, knex }, entity, action, subject, conditions, fields ) => {
  const target = getUnsubscriptionTarget( entity );
  const rule = {
    action,
    subject,
    conditions,
    fields
  };

  if ( !target ) {
    throw new Error( '`email` or `entityName` plus `identifier` are required for create an unsubscription link' );
  }

  const token = uuid();

  await knex( schemas.unsubscriptionLink )
    .insert( {
      token,
      target: JSON.stringify( target ),
      rule: JSON.stringify( abilitiesSvc.rules.format( rule ) )
    } );

  return token;
}
