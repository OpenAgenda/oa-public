"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const config = require( '../config' );
const crypto = require( './lib/crypto' );
const validators = require( './lib/validators' );
const _get = require( './lib/get' );
const _updateOrInsert = require( './lib/updateOrInsert' );

module.exports = function changePassword( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: _.pick( query, [ 'id', 'uid', 'email' ] ),
    query: Object.assign( {}, query ),
    valid: false,
    success: false,
    errors: []
  } )

    .then( _get )

    .then( _changePassword )

    .then( _hashPassword )

    .then( _updateOrInsert )

    .done( v => cb( null, {
      valid: v.valid,
      success: v.success,
      errors: v.errors
    } ), err => cb( err ) );

};

function _changePassword( v ) {

  if ( v.errors.length ) return v;

  var validator = validators.changePassword( v.query );


  v.valid = validator.valid;

  if ( !v.valid ) {

    v.errors = validator.errors;
    return v;

  }

  v.query.password = v.query.new_password;

  return v;

}

function _hashPassword( v ) {

  if ( v.query.password ) {

    var salt = crypto.randomHash(),

      password = crypto.hashPassword( v.query.password, salt );


    v.query.password = password;

    v.query.salt = salt;

  }

  return v;

}
