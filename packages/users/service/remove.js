"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const wn = require( 'when/node' );
const config = require( '../config' );
const _get = require( './lib/get' );

module.exports = function remove( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: _.pick( query, [ 'id', 'uid', 'email' ] ),
    query,
    errors: [],
    success: false,
    action: 'remove',
    user: false,
    params: {
      store: true
    }
  } )

    .then( _get )

    .then( _removeUser )

    .done( v => cb( null, v.success ), err => cb( err ) );

};

function _removeUser( v ) {

  const { knex, schemas } = config;

  if ( !v.user ) {

    v.errors.push( {
      code: 'user.notfound',
      message: 'user not found',
    } );
    v.success = false;

    return v;

  }

  return wn.call( config.interfaces.beforeRemove, v.user )

    .then( () => {

      let date = new Date();

      let store = JSON.parse( !v.user.store ? '{}' : v.user.store );

      store.email = v.user.email;

      return knex( schemas.user )

        .update( {
          is_removed: 1,
          is_activated: 0,
          updated_at: date,
          username: `*removed-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${v.user.id}`,
          email: null,
          store: JSON.stringify( store )
        } )

        .where( { id: v.user.id } );

    } )

    .then( affected => {

      v.success = affected === 1;

      return v;

    } );

}
