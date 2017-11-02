"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );
const parseListArguments = require( '@openagenda/service-utils/parseListArguments' );
const config = require( './config' );
const validateArgs = require( './validators/listArguments' );

module.exports = async ( identifiers, ...args ) => {

  let { query, offset, limit, options } = parseListArguments.apply( null, [ {} ].concat( args ) );
  const { knex, schemas } = config;

  try {
    ({ query, offset, limit, options } = validateArgs( { query, offset, limit, options } ));
  } catch ( e ) {
    throw new VError( {
      name: 'ValidationError',
      info: {
        errors: e
      }
    }, 'Validation failed' );
  }

  const baseRequest = knex( schemas.key ).where( identifiers );

  let total = null;

  if ( options && options.total ) {
    total = (await baseRequest.clone().count( '* as total' ))[ 0 ].total;
  }

  const items = await baseRequest.limit( limit ).offset( offset ).map( parse );

  return { items, total };

};

function parse( row ) {

  if ( !row ) return row;

  return _.mapKeys( row, ( v, k ) => _.camelCase( k ) );

}
