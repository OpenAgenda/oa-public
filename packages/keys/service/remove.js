"use strict";

const VError = require( 'verror' );
const config = require( './config' );
const get = require( './get' );

module.exports = async identifiers => {

  const { knex, schemas } = config;

  if ( !knex ) throw new VError( 'Db connector needs to be specified at service init' );

  const row = await get( identifiers );

  if ( row ) {

    return knex( schemas.key ).delete().where( { id: row.id } );

  }

  return null;

};
