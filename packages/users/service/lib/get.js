"use strict";

const config = require( '../../config' );

const basicFields = [ 'id', 'uid', 'full_name', 'username', 'email', 'image', 'culture', 'is_new', 'created_at', 'updated_at' ];
const detailedFields = [ 'id', 'uid', 'full_name', 'username', 'email', 'image', 'is_new',
  'facebook_uid', 'twitter_id', 'google_id', 'culture', 'is_activated', 'created_at',
  'updated_at', 'last_notified', 'is_removed', 'last_signin', 'comexposium_id' ];

module.exports = async function _get( v ) {

  const { schemas, knex, interfaces: { keys } } = config;

  const identifiers = Object.keys( v.identifier );
  const detailed = v.params && v.params.detailed;
  const password = v.params && v.params.password;
  const store = v.params && v.params.store;
  const removed = v.params && v.params.removed || false;

  const fields = (detailed ? detailedFields : basicFields)
    .concat( password ? [ 'password', 'salt' ] : [] )
    .concat( store ? 'store' : [] )
    .concat( !detailed && !removed ? 'is_removed' : [] )
    .map( v => `${schemas.user}.${v}` );

  let request = knex.column( fields ).select().from( schemas.user );

  if ( !removed ) {
    request = request.where( schemas.user + '.is_removed', 0 );
  }

  let whereColumn = schemas.user + '.' + ( identifiers[ 0 ] || 'id');
  let whereValue = v.identifier[ identifiers[ 0 ] ] || -1;

  if ( v.identifier.key ) {
    const keyResult = await keys.get( { type: 'userPublic', key: v.identifier.key } );

    if ( !keyResult ) return Promise.resolve( null );

    whereColumn = 'uid';
    whereValue = keyResult.identifier;
  }

  return request
    .where( whereColumn, whereValue )
    .limit( 1 )
    .then( async users => {

      v.user = users.length ? users[ 0 ] : null;

      if ( v.user && (detailed || v.identifier.key ) ) {
        v.user.api_key = await keys.get( { type: 'userPublic', identifier: v.user.uid } );
        v.user.api_secret = await keys.get( { type: 'userPrivate', identifier: v.user.uid } );

        if ( v.user.api_key ) v.user.api_key = v.user.api_key.key;
        if ( v.user.api_secret ) v.user.api_secret = v.user.api_secret.key;
      }

      return v;

    }, err => {

      throw new Error( err );

    } );

}
