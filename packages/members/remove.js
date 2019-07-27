"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'remove' );

const get = require( './get' );

module.exports = async ( config, identifiers ) => {

  const { knex, schema, interfaces } = config;

  const member = await get( config, identifiers );

  if ( !member ) throw new Error( 'Not found' );

  await knex( schema ).delete().where( 'id', member.id );

  if ( _.get( interfaces, 'onRemove' ) ) {
    try {
      await interfaces.onRemove( member );
    } catch ( e ) {
      log( 'error', 'interface onRemove exception for member %s', member.id, e );
    }
  }

  return {
    success: true
  }

}
