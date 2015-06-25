"use strict";

var config = {
  redis: false, // required. 
  database: false
},

store = require( './lib/store' ),

account = require( './lib/account' ),

esInt = require( './lib/interface' );

module.exports = {
  init: init
  linkAccount: linkAccount,
  getAccount: getAccount
}

function init( c ) {

  config = c;

  store.init( config.database );

}

function linkAccount( login, password, cb ) {

  esInt.GenerateAuthentification( {
    login: login,
    password: password
  }, function( err, result ) {

    if ( err || result.status !== 'SUCCESS' ) return cb( err, 'could not authenticate' );

    store.set( { login: login, password: password }, function( err, id ) {

      if ( err || !id ) return cb( err || 'could not create link' );

      getAccount( id, cb );

    } );

  });

}

function getAccount( id, cb ) {

  if ( !config ) {

    return cb( 'module has not been initialized' );

  }

  store.get( id, function( err, accountData ) {

    if ( err ) return cb( err );

    if ( !accountData ) return cb( null, null );

    cb( null, account( accountData ) );

  } );

}
