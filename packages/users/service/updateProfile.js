"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const utils = require( '@openagenda/utils' );
const defineUnique = require( '@openagenda/mysql-utils/defineUnique' );
const config = require( '../config' );
const validators = require( './lib/validators' );
const _updateOrInsert = require( './lib/updateOrInsert' );
const _checkEmailTaken = require( './lib/checkEmailTaken' );
const get = require( './get' );

module.exports = function updateProfile( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  // full_name & culture

  w( {
    identifier: _.pick( query, [ 'id', 'uid', 'email' ] ),
    query,
    user: null,
    valid: false,
    success: false,
    errors: []
  } )

    .then( _checkEmailTaken )

    .then( _filterForUpdateProfile )

    .then( _updateOrInsert )

    .then( _clean )

    .done( v => cb( null, {
      before: v.before,
      user: v.user,
      valid: v.valid,
      success: v.success,
      errors: v.errors
    } ), err => cb( err ) );

}

function _filterForUpdateProfile( v ) {

  if ( v.errors.length ) {

    return v;

  }

  var identifiers = Object.keys( v.identifier ),

    validator = validators.updateProfile( v.query ),

    fields = validator.fields;


  v.valid = validator.valid;


  if ( !v.valid ) {

    v.errors = validator.errors;
    return v;

  }

  identifiers.forEach( elem => fields[ elem ] = v.query[ elem ] );

  v.query = fields;

  return v;

}

function _clean( v ) {

  if ( v.user ) {

    v.user = utils.filterByAttr( v.user, [
      'id', 'uid', 'full_name', 'username', 'email', 'image', 'facebook_uid',
      'twitter_id', 'google_id', 'culture', 'is_activated', 'created_at', 'updated_at', 'last_notified', 'is_removed',
      'is_new', 'last_signin', 'comexposium_id', 'api_key', 'api_secret'
    ]
      .concat( v.params && v.params.store ? 'store' : [] ) );

    if ( v.params && v.params.store && v.user && v.user.store ) {

      v.user.store = JSON.parse( v.user.store || '{}' );

    }

  }

  return v;

}
