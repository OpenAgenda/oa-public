"use strict";

const VError = require( 'verror' );
const uuid = require( 'uuid' );
const defineUnique = require( 'mysql-utils/defineUnique' );
const config = require( './config' );
const get = require( './get' );
const validateIdentifiers = require( './validators/identifiers' );
const validate = require( './validators/create' );

module.exports = async ( identifiers, data ) => {

  const { knex, schemas } = config;

  if ( !knex ) throw new VError( 'db connector needs to be specified at service init' );

  try {
    identifiers = validateIdentifiers( identifiers, { allowId: false } );
    data = validate( data );
  } catch ( e ) {
    throw new VError( {
      name: 'ValidationError',
      info: {
        errors: e
      }
    }, 'Validation failed' );
  }

  let insertId;

  try {

    insertId = await knex( schemas.key ).insert( Object.assign(
      {},
      identifiers,
      {
        label: data.label,
        key: await getUuid(),
        created_at: new Date()
      }
    ) );

  } catch ( e ) {

    throw new VError( e, 'could not insert for ' + identifiers.id || `${identifiers.type} / ${identifiers.identifier}` );

  }

  return get( insertId[ 0 ] );

};

function getUuid() {

  return new Promise( ( resolve, reject ) => {

    defineUnique( {
      table: config.schemas.key,
      field: 'identifier',
      mysql: config.mysql
    }, () => uuid().replace( /-/g, '' ), ( err, uniqueValue ) => {

      if ( err ) return reject( err );
      resolve( uniqueValue );

    } );

  } );

}
