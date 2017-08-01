"use strict";

const _ = require( 'lodash' );
const w = require( 'when' );
const config = require( '../config' );
const _get = require( './lib/get' );
const _checkEmailTaken = require( './lib/checkEmailTaken' );
const _updateOrInsert = require( './lib/updateOrInsert' );

module.exports = function confirmChangeEmail( query, cb ) {

  if ( !config ) return cb( 'service not initialized' );

  w( {
    identifier: _.pick( query, [ 'id', 'uid', 'email' ] ),
    query: Object.assign( {}, query ),
    params: { store: true },
    errors: [],
    emailChanged: false
  } )

    .then( _get )

    .then( _checkEmailTaken )

    .then( _confirmChangeEmail )

    .then( _updateOrInsert )

    .done( v => cb( null, v.emailChanged ), err => cb( err ) );

};

function _confirmChangeEmail( v ) {

  var store = JSON.parse( v.user.store || '{}' );

  if ( store.new_email_token == v.query.token ) {

    v.query.email = store.new_email;

    delete v.query.token;

    delete store.new_email;

    delete store.new_email_token;

    v.query.store = JSON.stringify( store );

    v.emailChanged = true;

  }

  return v;

}
