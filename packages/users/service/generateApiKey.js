"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const config = require( '../config' );
const validators = require( './lib/validators' );
const crypto = require( './lib/crypto' );
const _get = require( './lib/get' );

module.exports = function generateApiKey( query, options, cb ) {

  if ( arguments.length == 2 ) {
    cb = options;
    options = {};
  }

  const params = Object.assign( {
    secret: false
  }, options );

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: _.pick( query, [ 'id', 'uid', 'email' ] ),
    query: Object.assign( {}, query ),
    params,
    errors: [],
    success: false
  } )

    .then( _get )

    .then( _generateApiKey )

    .then( _updateOrInsertApiKeySet ) // legacy bridge TODO remove this

    .done( v => cb( null, {
      success: v.success,
      errors: v.errors,
      key: v.params.secret ? v.query.api_secret : v.query.api_key
    } ), err => cb( err ) );

};

async function _generateApiKey( v ) {

  const { interfaces: { keys } } = config;

  if ( !v.user ) {
    v.errors.push( {
      code: 'user.notfound',
      message: 'user not found',
    } );
    v.success = false;

    return v;
  }

  await keys.remove( {
    type: v.params.secret ? 'userPrivate' : 'userPublic',
    identifier: v.user.uid
  } );

  const result = await keys.create( {
    type: v.params.secret ? 'userPrivate' : 'userPublic',
    identifier: v.user.uid
  } );

  v.query[ v.params.secret ? 'api_secret' : 'api_key' ] = result.key;
  v.success = true;

  return v;

}

function _updateOrInsertApiKeySet( v ) {

  const { knex, schemas } = config;

  if ( v.errors.length ) return v;

  return knex.transaction( trx => {

    return knex
      .select( '*' )
      .from( schemas.apiKeySet )
      .where( 'user_id', v.query.id || -1 )
      .limit( 1 )
      .transacting( trx );

  } )

    .then( keySets => {

      const keySet = keySets.length ? keySets[ 0 ] : null;

      return Object.assign( v, { keySet } );

    }, err => {

      throw new Error( err );

    } )

    .then( v => {

      const d = w.defer();

      const mode = v.keySet ? 'update' : 'insert',

        identifiers = Object.keys( v.identifier ),

        validator = validators.apiKeySet( v.query ),

        fields = validator.fields;


      v.valid = validator.valid;

      if ( !v.valid ) {

        v.errors = validator.errors;
        return d.resolve( v );

      }

      if ( mode == 'insert' ) {
        fields.user_id = v.user.id;
        fields.type = 1;
        fields.created_at = new Date();
      }
      fields.updated_at = new Date();

      knex.transaction( trx => {

        const queryBuilder = knex( schemas.apiKeySet )[ mode ]( fields );

        if ( mode == 'update' ) {

          queryBuilder.where( 'user_id', v.identifier[ identifiers[ 0 ] ] || -1 )

        }

        return queryBuilder.transacting( trx );

      } ).then( () => {
        v.success = true;

        return d.resolve( v );
      }, err => {

        return d.reject( err );

      } );

      return d.promise;

    } );

}
