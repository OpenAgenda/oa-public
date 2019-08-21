"use strict";

/**
 * service used by api web app ( api root folder ) to verify
 * validity of access tokens and nonce in requests
 *
 * creation of such tokens are done in legacy php symfony app
 */

const VError = require( 'verror' );
const log = require( '@openagenda/logs' )( 'services/accessTokens' );
const app = require( '../../app' );

let knex;

module.exports = {
  init,
  isValid,
  getUser,
  getUserFromKey
}

async function getUserFromKey( keyString = null ) {

  if ( !keyString ) {

    throw new VError( 'key is required' );

  }

  const apiKeySet = await knex( 'api_key_set' ).first( 'user_id' ).where( {
    api_key: keyString
  } );

  if ( !apiKeySet ) {

    throw new VError( 'no user found for given key', { key: keyString } );

  }

  return app.service( '/users' ).findOne( {
    query: {
      id: apiKeySet.user_id
    }
  } );

}

async function getUser( tokenString = null, nonce = null ) {

  const token = await _loadToken( tokenString );

  if ( !token ) _throwUnknownToken( tokenString );

  await _isValid( token, nonce );

  const apiKeySet = await knex( 'api_key_set' ).first( 'user_id' ).where( {
    id: token.api_key_set_id
  } );

  if ( !apiKeySet ) {

    throw new VError( 'could not find api key set matching token', { token: tokenString } );

  }

  return app.service( '/users' ).findOne( {
    query: {
      id: apiKeySet.user_id
    }
  } );

}


async function isValid( tokenString, nonce ) {

  const token = await _loadToken( tokenString );

  if ( !token ) _throwUnknownToken( tokenString );

  return _isValid( token, nonce );

}

function _loadToken( tokenString ) {

  return knex( 'access_token' ).first( [ 'id', 'created_at', 'lifespan', 'token', 'api_key_set_id' ] ).where( 'token', tokenString );

}

function _throwUnknownToken( tokenString ) {

  log( 'info', 'token not found', { token: tokenString } );

  throw new Error( 'access token is invalid' );

}

async function _isValid( token, nonce = null ) {

  log( 'info', 'verifying token', { token: token.token } );

  const timeOfDeath = ( new Date( token.created_at ) ).getTime() / 1000 + token.lifespan;

  const now = ( new Date ).getTime() / 1000;

  if ( timeOfDeath < now ) {

    log( 'info', 'token is expired', { token: token.token, timeOfDeath } );

    throw new Error( 'access token is expired' );

  }

  log( 'info', 'token is valid, verifying nonce', { token: token.token } );

  await flagNonce( token, nonce );

}

function init( c ) {

  knex = c.knex;

}

async function flagNonce( token = {}, nonce = null ) {

  const record = await knex( 'access_token_nonce' ).first( 'id' ).where( {
    access_token_id: token.id,
    nonce
  } );

  if ( record ) {

    log( 'info', 'nonce has already been used', { token: token.token, nonce } );

    throw new Error( 'nonce has already been used' );

  }

  await knex( 'access_token_nonce' ).insert( {
    access_token_id: token.id,
    nonce
  } );

  log( 'info', 'nonce was unique', { token: token.token, nonce } );

}
