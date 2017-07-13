"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );
const config = require( './config' );
const validateIdentifiers = require( './validators/identifiers' );

module.exports = async identifiers => {

  const { knex, schemas } = config;

  if ( !knex ) throw new VError( 'Db connector needs to be specified at service init' );

  try {
    identifiers = _.pickBy( validateIdentifiers( identifiers, { requireKey: true } ), v => v !== undefined );
  } catch ( e ) {
    throw new VError( {
      name: 'ValidationError',
      info: {
        errors: e
      }
    }, 'Validation failed' );
  }

  const row = await knex( schemas.key ).first().where( identifiers ) || null;

  return parse( row );

};

function parse( row ) {

  if ( !row ) return row;

  return _.mapKeys( row, ( v, k ) => _.camelCase( k ) );

}
