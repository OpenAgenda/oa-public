"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );
const config = require( './config' );
const validateIdentifiers = require( './validators/identifiers' );
const validate = require( './validators/update' );
const get = require( './get' );

module.exports = async ( identifiers, data ) => {

  const { knex, schemas } = config;

  if ( !knex ) throw new VError( 'Db connector needs to be specified at service init' );

  try {
    identifiers = _.pickBy( validateIdentifiers( identifiers, { requireKey: true } ), v => v !== undefined );
    data = _.pickBy( validate( data ), v => v !== undefined );
  } catch ( e ) {
    throw new VError( {
      name: 'ValidationError',
      info: {
        errors: e
      }
    }, 'Validation failed' );
  }

  await knex( schemas.key ).where( identifiers ).update( data );

  return get( identifiers );

};
