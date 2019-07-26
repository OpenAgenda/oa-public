"use strict";

const _ = require( 'lodash' );

module.exports = ( knex, id ) => knex( 'review' )
  .first( [
    'id',
    'uid',
    'title',
    'description',
    'slug',
    'url',
    'owner_id',
    'created_at',
    'updated_at',
    'image',
    'store',
    'settings',
    'main',
    'official',
    'private',
    'form_schema_id'
  ] ).where( 'id', id )
  .then( async review => review
    ? _.set( _.mapKeys( review, ( v, k ) => _.camelCase( k ) ), 'user', await knex( 'user' )
      .first( [ 'username', 'email' ] )
      .where( 'id', review.owner_id )
      .then( u => u ? _.mapValues( u, ( v, k ) => v ) : null )
    ) : null );
