"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const log = require( '@openagenda/basic-logger' )( 'users - set' );
const config = require( '../config' );
const crypto = require( './lib/crypto' );
const _updateOrInsert = require( './lib/updateOrInsert' );
const _checkEmailTaken = require( './lib/checkEmailTaken' );

module.exports = function set( query, options, cb ) {

  log( 'warning', 'DEPRECATED - set method is deprecated, uses the update method instead' );

  if ( arguments.length == 2 ) {
    cb = options;
    options = {};
  }

  const params = Object.assign( {
    detailed: false,
    protected: true
  }, options );

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: _.pick( query, [ 'id', 'uid' ] ),
    query: Object.assign( {}, query ),
    params,
    user: null,
    valid: false,
    success: false,
    errors: []
  } )

    .then( _checkEmailTaken )

    .then( _hashPassword )

    .then( _updateOrInsert )

    .done( v => cb( null, {
      user: v.user,
      valid: v.valid,
      success: v.success,
      errors: v.errors
    } ), err => cb( err ) );

}

function _hashPassword( v ) {

  if ( v.query.password ) {

    var salt = crypto.randomHash(),

      password = crypto.makeHashPassword( v.query.password, salt );


    v.query.password = password;

    v.query.salt = salt;

  }

  return v;

}
