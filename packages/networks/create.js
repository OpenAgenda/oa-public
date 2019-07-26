"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );
const validate = require( './validate' );

module.exports = async function( { knex, schema }, data ) {

  const clean = _.assign( validate.part( [ 'title' ], data ), {
    uid: await _fetchUnusedUid( knex, schema ),
    createdAt: new Date(),
    updatedAt: new Date()
  } );

  await knex( schema ).insert( _.mapKeys( clean, ( v, k ) => _.snakeCase( k ) ) );

  return clean;

}

async function _fetchUnusedUid( knex, schema, attempt = 0 ) {

  if ( attempt > 1000 ) throw new VError( 'Failed to find available network uid' );

  const uid = Math.floor( Math.random() * 100000000 );

  return knex( schema )
    .first( 'id' )
    .where( 'uid', uid )
    .then( ref => ref ? _fetchUnusedUid( knex, schema, ++attempt ) : uid );

}
