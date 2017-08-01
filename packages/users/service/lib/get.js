"use strict";

const config = require( '../../config' );

const basicFields = [ 'id', 'uid', 'full_name', 'username', 'email', 'image', 'is_new', 'created_at', 'updated_at' ];
const detailedFields = [ 'id', 'uid', 'full_name', 'username', 'email', 'image', 'is_new',
  'facebook_uid', 'twitter_id', 'google_id', 'culture', 'is_activated', 'created_at',
  'updated_at', 'last_notified', 'is_removed', 'last_signin', 'comexposium_id' ];

module.exports = function _get( v ) {

  const { schemas, knex } = config;

  const identifiers = Object.keys( v.identifier );
  const detailed = v.params && v.params.detailed;
  const password = v.params && v.params.password;
  const store = v.params && v.params.store;
  const removed = v.params && v.params.removed || false;

  const fields = (detailed ? detailedFields : basicFields)
    .concat( password ? [ 'password', 'salt' ] : [] )
    .concat( store ? 'store' : [] )
    .concat( !detailed && !removed ? 'is_removed' : [] )
    .map( v => `${schemas.user}.${v}` )
    .concat( detailed || v.identifier.key ? [ schemas.apiKeySet + '.api_key', schemas.apiKeySet + '.api_secret' ] : [] );

  let request = knex.column( fields ).select().from( schemas.user );

  if ( detailed || v.identifier.key ) {
    request = request.leftJoin( schemas.apiKeySet, schemas.user + '.id', schemas.apiKeySet + '.user_id' );
  }

  if ( !removed ) {
    request = request.where( schemas.user + '.is_removed', 0 );
  }

  const whereColumn = v.identifier.key ? schemas.apiKeySet + '.api_key' : schemas.user + '.' + ( identifiers[ 0 ] || 'id' );
  const whereValue = v.identifier[ identifiers[ 0 ] ] || -1;

  return request
    .where( whereColumn, whereValue )
    .limit( 1 )
    .then( users => {

      v.user = users.length ? users[ 0 ] : null;

      return v;

    }, err => {

      throw new Error( err );

    } );

}
