"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const config = require( '../config' );
const crypto = require( './lib/crypto' );
const _get = require( './lib/get' );

module.exports = function verifyPassword( query, options, cb ) {

  if ( !cb ) {
    cb = options;
    options = {};
  }

  if ( !config ) return cb( 'service not initialized' );

  const params = _.merge( {
    password: true,
    get: false
  }, options );

  w( {
    identifier: _.pick( query, [ 'id', 'uid', 'email' ] ),
    params,
    query,
    success: false
  } )

    .then( _get )

    .then( _verifyPassword )

    .done( v => cb( null, v.params.get ? {
      success: v.success,
      user: v.user
    } : v.success ), err => cb( err ) );

};

function _verifyPassword( v ) {

  v.success = crypto.verifyPassword( v.user.password, v.query.password, v.user.salt );

  return v;

}
