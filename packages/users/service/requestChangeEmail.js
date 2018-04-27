"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const config = require( '../config' );
const validators = require( './lib/validators' );
const crypto = require( './lib/crypto' );
const _updateOrInsert = require( './lib/updateOrInsert' );
const _checkEmailTaken = require( './lib/checkEmailTaken' );
const _get = require( './lib/get' );

module.exports = function requestChangeEmail( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: _.pick( query, [ 'id', 'uid', 'email' ] ),
    query: Object.assign( {}, query ),
    params: { store: true },
    valid: false,
    success: false,
    errors: [],
    token: null
  } )

    .then( _get )

    .then( _checkEmailTaken )

    .then( _requestChangeEmail )

    .then( _updateOrInsert )

    .done( v => cb( null, {
      valid: v.valid,
      success: v.success,
      errors: v.errors,
      token: v.token
    } ), err => cb( err ) );

};

function _requestChangeEmail( v ) {

  if ( v.errors.length ) return v;

  var validator = validators.changeEmail( v.query );


  v.valid = validator.valid;

  if ( !v.valid ) {

    v.errors = validator.errors;
    return v;

  }


  var store = JSON.parse( v.user.store || '{}' ),

    token = crypto.randomHash();


  store.new_email = v.query.email;

  store.new_email_token = token;

  v.token = token;

  v.query.store = JSON.stringify( store );


  delete v.query.email;

  delete v.query.password;


  return v;

}
