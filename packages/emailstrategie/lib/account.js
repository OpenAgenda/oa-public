"use strict";

var utils = require( 'utils' ),

list = require( './list' ),

store = require( './store' ),

esInt = require( './interface' );

module.exports = function( data ) {

  var token;

  return utils.extend( {
    update: update,
    createList: createList,
    getList: getList
  }, data );

  function update( toUpdate, cb ) {

    var updated = utils.extend( 
      {}, 
      data,
      toUpdate
    );

    _getToken( updated.login, updated.password, function( err, token ) {

      if ( err ) return cb( err );

      utils.extend( data, updated );

      store.set( utils.extend( {
        id: data.id
      }, toUpdate ), cb );

    } );

  }

  function createList( fields, cb ) {

    _getToken( data.login, data.password, function( err, token ) {

      if ( err ) return cb( err );

      if ( fields[ 0 ] !== 'id' ) fields.splice( 0, 0, 'id' );

      esInt.SaveList( 'OpenAgenda', fields, function( err, id ) {

        if ( err ) return cb( err );

        data.listIds.push( id );

        store.set( data, function( err ) {

          if ( err ) return cb( err );

          cb( null, list( { 
            id: listId, 
            accountId: data.id,
            token: token
          } ) );

        } );

      });

    } );

  }

  function getList( cb ) {

    var listId = data.listIds.length ? data.listIds[ 0 ] : false;

    if ( !listId ) return cb( 'account has no list' );

    _getToken( function( err, token ) {

      if ( err ) return cb( err );

      cb( null, list( {
        id: listId,
        accountId: data.id,
        token: token
      } ) );

    });

  }

  function _getToken( cb ) {

     var login, password;

    if ( arguments.length == 1 ) {

      login = data.login;

      password = data.password;

    } else {

      login = arguments[ 0 ];

      password = arguments[ 1 ];

      cb = arguments[ 2 ];

    }

    esInt.GenerateAuthentification( {
      login: login,
      password: password
    }, function( err, result ) {

      if ( err ) return cb( err );

      if ( result.status !== 'SUCCESS' ) return cb( null, false );

      cb( null, result.token );

    } );

}