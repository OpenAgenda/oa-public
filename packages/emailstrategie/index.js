"use strict";

var config = {
  redis: false, // required. 
  database: false
},

store = require( './lib/store' ),

account = require( './lib/account' ),

esInt = require( './lib/interface' ),

task = require( './lib/task' );

module.exports = {
  task: task,
  init: init,
  linkAccount: linkAccount,
  getAccount: getAccount,
  getAccountList: getAccountList
}

function init( c ) {

  config = c;

  store.init( config.database );

  task.init( config.redis, getAccount );

}

function linkAccount( login, password, cb ) {

  esInt.GenerateAuthentification( {
    login: login,
    password: password
  }, function( err, result ) {

    if ( err ) return cb( err );

    if ( result.status !== 'SUCCESS' ) return cb( null, false );

    store.set( { login: login, password: password }, function( err, id ) {

      if ( err || !id ) return cb( err || 'could not create link' );

      getAccount( id, cb );

    } );

  });

}

function getAccountList( id, cb ) {

  if ( !config ) {

    return cb( 'module has not been initialized' );

  }

  getAccount( id, function( err, account ) {

    if ( err ) return cb( err );

    if ( !account ) return cb( null, null );

    account.getList( function( err, list ) {

      if ( err ) return cb( err );

      return cb( null, {
        account: account,
        list: list
      } );

    });

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
