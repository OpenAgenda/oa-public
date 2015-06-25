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
    getList: getList,
    unlink: unlink
  }, data );

  function unlink( cb ) {

    getList( function( err, list ) {

      if ( err ) return cb( err );

      if ( list ) {

        list.remove( function( err ) {

          if ( err ) return cb( err );

          _del( cb );

        } );

      } else {

        _del( cb );

      }

    } );

  }

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

  function createList( name, fields, cb ) {

    _getToken( data.login, data.password, function( err, token ) {

      if ( err ) return cb( err );

      if ( fields[ 0 ] !== 'id' ) fields.splice( 0, 0, 'id' );

      esInt.SaveList( {
        token: token,
        listVO: {
          name: name,
          fieldList: fields
        }
      }, function( err, id ) {

        if ( err ) return cb( err );

        data.lists.push( { id: id, name: name } );

        store.set( data, function( err ) {

          if ( err ) return cb( err );

          cb( null, list( { 
            id: id, 
            accountId: data.id,
            name: name,
            token: token
          } ) );

        } );

      });

    } );

  }

  function getList( cb ) {

    var listId = data.lists.length ? data.lists[ 0 ].id : false;

    if ( !listId ) return cb( null, null );

    _getToken( function( err, token ) {

      if ( err ) return cb( err );

      cb( null, list( {
        id: listId,
        name: data.lists[ 0 ].name,
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

  function _del( cb ) {

    store.del( data.id, cb );

  }

}